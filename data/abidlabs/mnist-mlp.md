# abidlabs/mnist-mlp

## Resumen

mnist-mlp es un perceptrón multicapa (MLP) minúsculo entrenado desde cero (inicialización aleatoria, sin pesos preentrenados) sobre el conjunto de datos ylecun/mnist para clasificación de dígitos manuscritos. Lo publica el usuario de HuggingFace abidlabs y su único propósito declarado es servir como modelo de referencia reproducible: la model card indica que se puede regenerar ejecutando `python train.py` con el mismo script incluido en el repositorio.

El modelo tiene 235.146 parámetros y una arquitectura totalmente conectada de tres capas (784 -> 256 -> 128 -> 10) con activaciones ReLU. Se entrenó durante 5 épocas con lotes de 256 y optimizador Adam con tasa de aprendizaje 0,002, lo que supone 1.170 pasos de optimización. La precisión reportada en el conjunto de test de 10.000 imágenes es de 0,9772, y el tiempo de entrenamiento declarado es de 5,5 segundos en una instancia cpu-basic (2 vCPU), lo que lo convierte en un ejemplo de coste computacional prácticamente nulo.

Su relevancia no está en el rendimiento ni en la novedad técnica, sino en su utilidad como pieza didáctica y como smoke test de infraestructura: un modelo que entrena en segundos en CPU resulta cómodo para validar entornos de PyTorch, pipelines de integración continua, demos interactivas o ejercicios de docencia. No es un modelo de lenguaje, no genera texto y no dispone de tool calling ni de capacidades multimodales más allá de la clasificación de imágenes de un solo canal y 28x28 píxeles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) totalmente conectado, 784 -> 256 -> 128 -> 10, activación ReLU |
| Parametros totales | 235.146 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (clasificador de imágenes; entrada fija de 784 valores) |
| Tipos de cuantizacion | No disponible (la model card no documenta ninguna) |
| Idiomas soportados | No aplica (no procesa texto); la model card no declara idiomas, "no disponibles" en los metadatos |
| Licencia | no disponible |
| Formato de pesos | `model.pt`, un `state_dict` plano de PyTorch (no safetensors, no GGUF) |
| Libreria declarada | pytorch |
| Pipeline | image-classification |
| Dataset de entrenamiento | ylecun/mnist |
| Tamaño del repositorio | 0,0 GB según los metadatos de HuggingFace |

## Arquitectura y entrenamiento

La red es un MLP clásico de tres capas densas con activaciones ReLU: una capa de entrada de 784 unidades (28x28 píxeles aplanados), dos capas ocultas de 256 y 128 unidades y una capa de salida de 10 logits, uno por dígito. El coste por muestra es de aproximadamente 234.752 operaciones de multiplicación-suma (unos 0,47 MFLOPs), un orden de magnitud inferior al de cualquier CNN pequeña. El entrenamiento se realizó desde cero, con inicialización aleatoria y sin pesos preentrenados, durante 5 épocas con tamaño de lote 256 y optimizador Adam con learning rate 0,002, hasta completar 1.170 pasos. La model card declara una precisión de 0,9772 sobre las 10.000 imágenes del conjunto de test y un tiempo de entrenamiento de 5,5 segundos en 2 vCPU.

No se documenta ninguna innovación técnica: no hay atención, ni decodificación especulativa, ni capas convolucionales, ni regularización descrita (dropout, weight decay), ni aumento de datos, ni búsqueda de hiperparámetros. Tampoco se indica que se haya aplicado RLHF, DPO o ajuste fino posterior, algo que no aplica en un clasificador supervisado de 10 clases. El artefacto publicado es un `state_dict` plano de PyTorch que requiere la definición de clase contenida en `train.py`, por lo que la reproducibilidad exacta depende de ese script.

## Capacidades

- Clasificación de dígitos manuscritos en 10 clases (0-9) a partir de imágenes en escala de grises de 28x28 píxeles.
- Salida de 10 logits por imagen, convertibles en probabilidades mediante softmax por parte del consumidor del modelo.
- Precisión declarada de 0,9772 sobre el conjunto de test de 10.000 imágenes de MNIST.
- Entrenamiento reproducible en segundos en CPU mediante el script `train.py` incluido en el repositorio.
- No soporta generación de texto, razonamiento, código ni matemáticas: es exclusivamente un clasificador visual.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni procesa lenguaje natural.
- No dispone de modo "thinking", visión general, audio ni otras modalidades: la entrada está limitada a imágenes monocanal de 28x28.
- No se documenta una interfaz de embeddings ni extracción de características de las capas ocultas, aunque los pesos permitirían hacerlo de forma no oficial.

## Casos de uso

- Docencia y material didáctico: por su tamaño (235.146 parámetros) y su tiempo de entrenamiento de 5,5 segundos en 2 vCPU, permite que un estudiante entrene, modifique y evalúe la red completa en una sesión de clase para ilustrar descenso de gradiente, sobreajuste y evaluación sobre test.
- Smoke test de infraestructura de entrenamiento: sirve para verificar que un entorno con PyTorch, CUDA o un runner de CI está correctamente configurado antes de lanzar trabajos costosos, ya que un ciclo completo de entrenamiento termina en segundos.
- Demos interactivas de interfaz: al ser un clasificador de imagen rápida y ligera, encaja en prototipos de aplicaciones web donde el usuario dibuja un dígito en un lienzo y recibe la predicción, sin necesidad de GPU ni de servidores de inferencia dedicados.
- Componente previo en pipelines de digitalización de formularios: puede actuar como clasificador de dígitos aislados previamente segmentados, por ejemplo casillas numéricas separadas, siempre que la imagen se normalice a 28x28 en escala de grises.
- Validación de pipelines de exportación y empaquetado: al ser un `state_dict` plano de PyTorch, es un candidato cómodo para probar conversiones a TorchScript, ONNX u otros formatos, y para verificar que el pipeline de serialización y despliegue funciona de extremo a extremo.
- Pruebas de regresión de código de preprocesado: permite comprobar de forma objetiva si un cambio en el tratamiento de imágenes (redimensionado, inversión de contraste, normalización) degrada la precisión, dado que la precisión de referencia está documentada y existe un conjunto de test público.
- Benchmark de latencia en CPU: con un coste de unos 0,47 MFLOPs por muestra, es útil para medir la sobrecarga de frameworks y de servidores de inferencia en escenarios sin acelerador, donde el cuello de botella no es el cálculo sino el código.
- Ejercicios de comparación de arquitecturas: sirve como línea base de MLP frente a modelos convolucionales en el mismo conjunto de datos, dentro de prácticas de aprendizaje automático.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision en test (10.000 imagenes de MNIST) | 0,9772 |
| Parametros | 235.146 |
| Pasos de entrenamiento | 1.170 |
| Epocas | 5 |
| Tamaño de lote | 256 |
| Optimizador / learning rate | Adam / 0,002 |
| Tiempo de entrenamiento | 5,5 s en cpu-basic (2 vCPU) |
| Comparacion con otros modelos | No se han publicado resultados comparativos en la informacion disponible. |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible, algo esperable porque el modelo es un clasificador de imágenes y no un modelo de lenguaje. La model card tampoco incluye matriz de confusión, precisión por clase, curvas de aprendizaje ni métricas de calibración.

## Requisitos de hardware

- VRAM en precisión completa (fp32): aproximadamente 0,90 MiB para los pesos (235.146 parámetros x 4 bytes), sin contar activaciones ni memoria del framework.
- VRAM en fp16: aproximadamente 0,45 MiB para los pesos.
- GPU recomendadas: ninguna en particular; cualquier GPU, incluida una integrada, es suficiente. No se requiere acelerador.
- Inferencia en CPU: es el escenario natural. El modelo se entrenó en 5,5 segundos en 2 vCPU sobre 5 épocas (300.000 imágenes procesadas), lo que equivale a una tasa de aproximadamente 54.500 imágenes por segundo en entrenamiento según estimación derivada de los datos reportados; la inferencia, al no incluir retropropagación, debería ser igual o más rápida, aunque no hay una medición publicada.
- Cabe en cualquier GPU de consumo: sí, con un consumo de memoria despreciable, así como en dispositivos de borde y en entornos sin GPU.
- Opciones de despliegue: PyTorch nativo cargando el `state_dict` con la definición de `train.py`; la conversión a TorchScript u ONNX es técnicamente viable pero no está documentada por el autor. vLLM, llama.cpp, Ollama y TGI no aplican a este modelo: son herramientas orientadas a modelos de lenguaje y no soportan clasificación de imágenes con este artefacto.
- Latencia y throughput: no se han publicado mediciones de inferencia. La única referencia temporal disponible es el tiempo de entrenamiento declarado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Precision en MNIST | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| abidlabs/mnist-mlp | MLP 784-256-128-10 | 235.146 | 0,9772 (reportada) | no disponible | HuggingFace |
| LeNet-5 (arquitectura clásica de CNN para MNIST) | CNN | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible | Implementaciones multiples |
| MLP de mayor capacidad (por ejemplo 784-512-512-10) | MLP | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible | Implementaciones multiples |
| CNN pequeña moderna para MNIST | CNN | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible | Implementaciones multiples |

No se dispone de cifras verificadas de los modelos alternativos en las fuentes consultadas, por lo que la comparación cuantitativa queda como "no disponible". La diferencia cualitativa relevante es que este modelo es un MLP sin sesgo inductivo convolucional, lo que en MNIST se traduce típicamente en una precisión inferior a la de arquitecturas convolucionales del mismo orden de magnitud de parámetros; no obstante, no se ha encontrado una medición publicada que permita cuantificar esa brecha sin recurrir a datos externos no verificados.

## Limitaciones y advertencias

- Ámbito funcional muy estrecho: solo clasifica dígitos manuscritos de 0 a 9. No procesa texto, no genera contenido y no sirve para tareas fuera de esa distribución.
- Entrada rígida: imágenes de 28x28 en escala de grises. La model card no documenta el preprocesado exacto (normalización, inversión de contraste ni criterio de escalado), por lo que integrarlo con imágenes reales exige experimentar y validar.
- Tasa de error del 2,28 % en test según la precisión reportada; no hay métricas por clase, matriz de confusión ni información de calibración, de modo que no se conoce si los errores se concentran en determinados dígitos.
- Sesgo de dominio del dataset: MNIST procede de bases de escritura manuscrita estadounidenses (Census Bureau y estudiantes de instituto), por lo que el rendimiento puede degradarse con caligrafías, alfabetos numéricos o estilos de escritura distintos a los de esa población.
- MNIST contiene errores de etiquetado conocidos y ejemplos ambiguos o duplicados, lo que introduce un ruido de etiqueta que ningún modelo puede superar con este conjunto de evaluación.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de clasificación errónea confiada: no hay información publicada sobre la fiabilidad de las probabilidades de salida.
- No hay datos sobre robustez frente a rotaciones, ruido, oclusiones, imágenes invertidas o adversariales.
- Licencia no disponible: al no declararse una licencia, no puede asumirse permiso para uso comercial ni redistribución. Es un caveat importante antes de integrarlo en un producto.
- Dependencia del código del autor: el peso publicado es un `state_dict` plano que necesita la definición de clase de `train.py`; sin ese script la carga directa no es trivial, y no hay versión en safetensors ni pesos fusionados.
- Cero adopción registrada en HuggingFace en el momento de los metadatos (0 descargas, 0 likes), lo que implica ausencia de validación externa, de issues reportados y de mantenimiento conocido.
- No es un modelo instructivo ni conversacional: cualquier expectativa de uso como asistente, agente o generador de código es inaplicable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abidlabs/mnist-mlp
- Repositorio de archivos del modelo, incluido `model.pt` y `train.py` citados en la model card: https://huggingface.co/abidlabs/mnist-mlp/tree/main
- Dataset empleado, ylecun/mnist: https://huggingface.co/datasets/ylecun/mnist
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo. Los resultados devueltos corresponden a la película "Bardo, False Chronicle of a Handful of Truths" (Wikipedia, IMDb, Netflix, Rotten Tomatoes, The New York Times) y no guardan ninguna relación con el modelo. No se dispone de paper, blog técnico, repositorio adicional ni demo asociados.
