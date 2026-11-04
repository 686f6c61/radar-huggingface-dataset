# bhanuprakash368/cifar10-mlp-vs-iocnn

## Resumen

Este repositorio de Hugging Face no contiene un modelo de lenguaje, sino los checkpoints de dos clasificadores de imágenes entrenados sobre CIFAR-10 para la asignación 4 (pregunta 1) de la asignatura Statistical Methods in AI (Monsoon 2026). El autor, bhanuprakash368, publica dos perceptrones multicapa con topología idéntica ([3072, 256, 128, 10]) y 820.874 parámetros: un MLP convencional con activaciones ReLU y pesos sin restricciones, y una red neuronal convexa de entrada-salida (IOC-NN, Input-Output Convex Neural Network) con activaciones ELU y pesos no negativos en las capas ocultas.

El interés técnico del artefacto es comparativo: ambos modelos comparten profundidad y anchura, de modo que las diferencias de comportamiento se atribuyen al uso de convexidad entrada-salida frente a un MLP estándar. La IOC-NN impone W^(l) >= 0 mediante la proyección w <- exp(w - 5), lo que garantiza matemáticamente la convexidad de los logits pre-softmax respecto a la entrada.

No se trata de un modelo generativo ni de propósito general: es un experimento académico de clasificación de imágenes a 10 clases, con pesos en formato NumPy (.npz) y sin model card orientada a producción. No hay información sobre licencia, idiomas ni pipeline de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MLP) feed-forward; variante IOC-NN con convexidad entrada-salida |
| Parametros totales | 820.874 (ambos modelos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (clasificador de imagenes, no modelo de lenguaje) |
| Tipos de cuantizacion | No disponible (pesos en float, formato NumPy) |
| Idiomas soportados | No disponible (no es un modelo linguistico) |
| Licencia | No disponible |
| Formato de pesos | NumPy `.npz` (`mlp_selected_final.npz`, `ioc_selected_final.npz`) |

## Arquitectura y entrenamiento

Ambos modelos comparten una topología feed-forward con dimensiones de capa [3072, 256, 128, 10]. La entrada son imágenes RGB de 32x32x3 aplanadas a 3.072 dimensiones, escaladas dividiendo por 255.0 en float64 y estandarizadas por característica (media cero, varianza unitaria) usando exclusivamente estadísticas del conjunto de entrenamiento.

El MLP seleccionado usa activaciones ReLU en las capas ocultas, pesos reales sin restricciones y optimización con SGD por mini-lotes (lr = 0.05, batch size = 64). La IOC-NN seleccionada usa activaciones ELU y restringe los pesos de las capas l >= 2 a valores no negativos mediante la proyección w <- exp(w - 5), lo que garantiza convexidad entrada-salida de todos los logits pre-softmax. No se especifican en la información disponible el número de épocas, la composición exacta del split de entrenamiento/validación ni si hubo aumento de datos. No se documenta uso de RLHF, DPO ni técnicas de alineación (no aplicables a este tipo de modelo).

## Capacidades

- Clasificación de imágenes CIFAR-10 en 10 clases (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Entrada exclusivamente RGB de 32x32 píxeles, aplanada a 3.072 dimensiones; no admite otras resoluciones sin reentrenamiento.
- El MLP actúa como línea base estándar; la IOC-NN aporta convexidad entrada-salida matemáticamente garantizada sobre los logits pre-softmax.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües, de visión general, audio ni modo de pensamiento (thinking mode).
- No es un modelo generativo: no produce texto ni imágenes.

## Casos de uso

- Docencia y experimentación en convexidad de redes: comparar empíricamente un MLP estándar frente a una IOC-NN con idéntica topología para ilustrar el efecto de las restricciones de pesos no negativos sobre la superficie de decisión.
- Reproducción de la asignación 4 (pregunta 1) de Statistical Methods in AI (Monsoon 2026): cargar los `.npz` y verificar los resultados reportados en el enunciado.
- Análisis de robustez y calibración: estudiar cómo la convexidad entrada-salida afecta a la confianza de los logits y al comportamiento frente a entradas fuera de distribución en CIFAR-10.
- Investigación en optimización restringida: usar la proyección w <- exp(w - 5) como referencia para implementar parametrizaciones que mantengan pesos positivos durante el entrenamiento.
- Pruebas de infraestructura de clasificación ligera: con 820.874 parámetros, ambos modelos caben en CPU y sirven como banco de pruebas para pipelines de inferencia de bajo coste.
- Comparación de funciones de activación: evaluar ReLU frente a ELU en una topología fija y con el mismo presupuesto de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye precisión en test, curvas de entrenamiento ni comparaciones numéricas entre ambos modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en float32 (820.874 parámetros x 4 bytes, aproximadamente 3,3 MB de pesos, más activaciones intermedias mínimas). Cabe holgadamente en cualquier GPU consumer, en CPU e incluso en entornos embebidos.
- GPU recomendadas: no se requiere GPU; cualquier GPU moderna (RTX 4090, A100, H100) ejecutaría la inferencia con latencia despreciable. Para entrenamiento, una GPU consumer básica es suficiente.
- Cabe en cualquier GPU consumer, incluida la gama integrada.
- Opciones de despliegue: carga directa con NumPy desde los `.npz`; no hay integración documentada con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este formato).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Restriccion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MLP CIFAR-10 (este repo) | 820.874 | 32x32x3 | Ninguna (ReLU, SGD) | No disponible | `.npz` en Hugging Face |
| IOC-NN CIFAR-10 (este repo) | 820.874 | 32x32x3 | Pesos >= 0 en l >= 2 (ELU) | No disponible | `.npz` en Hugging Face |
| ResNet-18 CIFAR-10 (referencia habitual) | ~11,2 M | 32x32x3 | Ninguna | Varía segun implementacion | Multiples repositorios publicos |
| VGG-11 CIFAR-10 (referencia habitual) | ~9,2 M | 32x32x3 | Ninguna | Varía segun implementacion | Multiples repositorios publicos |

La comparación con ResNet-18 y VGG-11 es orientativa por categoría de tarea (clasificación CIFAR-10), no por resultados medidos en este repositorio; no se dispone de cifras de precisión comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse con criterios de generación de texto, contexto o tool calling.
- Entrada rígida de 32x32x3 píxeles; cualquier otra resolución requiere redimensionado y reentrenamiento para mantener el rendimiento.
- Sin licencia declarada: no se puede asumir permiso de uso comercial; conviene contactar con el autor antes de cualquier uso fuera del ámbito académico.
- Sin métricas publicadas: no hay evidencia en la model card sobre precisión en test, sobreajuste ni comparación cuantitativa MLP vs. IOC-NN.
- Riesgo de sesgo heredado de CIFAR-10: el dataset contiene clases desbalanceadas y estereotipos visuales conocidos; los clasificadores pueden fallar de forma sistemática en ciertas categorías.
- Los pesos están en `.npz` (NumPy), no en safetensors ni GGUF; requieren código propio para cargar y ejecutar la inferencia.
- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0.0 GB reportado: verificar la integridad de los ficheros antes de usarlos en producción o docencia.
- No hay información sobre el proceso de selección de hiperparámetros ni sobre el conjunto de validación empleado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bhanuprakash368/cifar10-mlp-vs-iocnn
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
