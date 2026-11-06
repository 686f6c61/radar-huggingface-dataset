# MadKane/smai-a4-iocnn-p0-torch

## Resumen

`MadKane/smai-a4-iocnn-p0-torch` es un modelo de clasificación de imágenes desarrollado por Madhur Kankane en el marco de la asignatura Statistical Methods in AI (IIIT Hyderabad, Monsoon 2026, Assignment 4, cuestiones 1.4 y 1.5). No es un modelo de propósito general ni un lanzamiento de producto: se trata de un artefacto académico que implementa una red neuronal convexa de entrada-salida (IOC-NN, input-output convex neural network) aplicada a CIFAR-10, con una arquitectura MLP de tres capas (3072 → 256 → 10) y 789.258 parámetros.

El interés técnico del modelo radica en su restricción estructural: cada logit de salida es una función convexa de la entrada. Para ello, la primera capa permanece sin restricciones, se emplea una activación ELU (convexa y no decreciente) y los pesos de la capa de salida se fuerzan a ser no negativos tras cada paso de SGD, sustituyendo cada peso negativo `w` por `e^(w−5)`. La idea proviene del trabajo de Sivaprasad et al., *The Curious Case of Convex Neural Networks* (arXiv:2006.05103), y el modelo se concibe como una de las dos ramas de comparación (frente a un MLP de idéntica forma) del apartado 1.5 del enunciado.

El resultado es modesto: una precisión de test de 0,4786 en la época 100, con un máximo de 0,5232 en la época 33, y una precisión de entrenamiento de 0,8365. El modelo no está pensado para producción, sino para ilustrar el compromiso entre convexidad estructural y capacidad de ajuste en un dataset de referencia. El repositorio no incluye licencia declarada ni información sobre idiomas, y su tamaño es de 0,0 GB según Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP (red neuronal convexa de entrada-salida, IOC-NN): 3072 → 256 (ELU) → 10 logits |
| Parámetros totales | 789.258 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada de 3072 valores = imagen 32×32×3 aplanada) |
| Tipos de cuantización | no disponible (pesos en float32) |
| Idiomas soportados | no disponible (no aplica; clasificación de imágenes) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `state_dict` (`ioc-p0.pt`), más `preprocessing.npz`, `config.json` y `history.json` |

## Arquitectura y entrenamiento

La arquitectura es un perceptrón multicapa de tres capas con 3072 entradas (imágenes CIFAR-10 de 32×32×3 aplanadas), una capa oculta de 256 unidades con activación ELU (alpha = 1.0) y 10 logits de salida. La restricción de convexidad se impone en tres puntos: la primera capa no tiene restricciones, la ELU es convexa y no decreciente, y los pesos de la capa de salida se mantienen no negativos mediante la proyección `w ← e^(w−5)` aplicada a cada peso negativo tras cada paso de optimización. Con ello, la función que mapea entrada a logit es convexa por composición de funciones convexas y no decrecientes.

El entrenamiento se realizó con SGD sin momentum, learning rate 0,01, batch size 64, 100 épocas, pérdida de entropía cruzada, precisión float32 y semilla 2061, sobre las 50.000 imágenes del conjunto de entrenamiento de CIFAR-10 con etiquetas verdaderas (p = 0, es decir, sin ruido de etiqueta). El preprocesado aplica normalización por píxel usando la media y desviación típica calculadas sobre las 50.000 imágenes de entrenamiento, almacenadas en `preprocessing.npz`. No se documenta uso de RLHF, DPO ni aumentación de datos.

## Capacidades

- Clasificación de imágenes de CIFAR-10 en 10 categorías (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Entrada exclusivamente de imágenes de 32×32×3 píxeles en formato uint8, normalizadas con la media y desviación típica proporcionadas.
- Salida de 10 logits crudos (sin capa softmax incorporada en el `state_dict`; el usuario debe aplicar softmax si necesita probabilidades).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión general: está especializado en un único dataset y resolución.
- No dispone de modo thinking, audio ni ninguna capacidad multimodal más allá de la clasificación de imágenes de baja resolución.

## Casos de uso

- Docencia y reproducibilidad de IOC-NN: el modelo sirve como referencia ejecutable para asignaturas que estudien redes convexas, permitiendo cargar el `state_dict` y reproducir las curvas de `history.json` con la semilla 2061.
- Comparación controlada MLP frente a IOC-NN: al compartir forma y ajustes de entrenamiento con el MLP del apartado 1.5, permite aislar el efecto de la restricción de convexidad sobre la precisión de test (0,4786 frente al MLP de referencia).
- Estudio del compromiso convexidad-capacidad: útil para analizar por qué la restricción de pesos no negativos limita la expresividad y provoca sobreajuste (0,8365 de train frente a 0,4786 de test).
- Prototipado de pipelines de clasificación de imágenes de bajo coste: con 789.258 parámetros y pesos float32, el modelo cabe en CPU y sirve para validar código de preprocesado y evaluación antes de escalar a arquitecturas mayores.
- Referencia en experimentos de regularización estructural: permite comparar técnicas de proyección de pesos (como `e^(w−5)`) frente a otras alternativas de mantenimiento de signo.
- Reproducción de resultados de un paper: el modelo materializa la propuesta de Sivaprasad et al. (arXiv:2006.05103) en un caso concreto, útil para verificar afirmaciones teóricas sobre convexidad en la práctica.
- Ejercicio de análisis de curvas de aprendizaje: `history.json` contiene pérdida y precisión por época en train y test, lo que facilita estudiar el momento de máximo rendimiento (época 33) y el posterior deterioro.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son los de entrenamiento y evaluación sobre CIFAR-10:

| Métrica | Valor |
|---|---|
| Precisión de test (época 100) | 0,4786 |
| Mejor precisión de test (época 33) | 0,5232 |
| Precisión de entrenamiento (época 100) | 0,8365 |
| Dataset | CIFAR-10, 50.000 imágenes de entrenamiento, etiquetas verdaderas (p = 0) |
| Optimizador | SGD sin momentum, lr 0,01, batch 64, 100 épocas |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en float32 (789.258 parámetros × 4 bytes ≈ 3,2 MB, más activaciones y buffers), por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; funciona en CPU sin problema. Cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) es sobradamente suficiente.
- Cabe en GPU consumer: sí, en todas, incluidas las integradas.
- Opciones de despliegue: PyTorch nativo (`torch.load` del `state_dict`), exportación a TorchScript u ONNX, o conversión manual a otros formatos. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, la inferencia por imagen es del orden de microsegundos a milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto / entrada | Precisión CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `MadKane/smai-a4-iocnn-p0-torch` | MLP IOC-NN 3072→256→10 | 789.258 | Imagen 32×32×3 | 0,4786 (test, época 100); 0,5232 mejor | no disponible | Hugging Face |
| MLP del apartado 1.5 (mismo autor, misma forma) | MLP 3072→256→10 | 789.258 | Imagen 32×32×3 | no disponible en la información proporcionada | no disponible | Referenciado en la model card, no enlazado |
| Redes convolucionales estándar para CIFAR-10 | CNN | variable | Imagen 32×32×3 | no disponible en la información proporcionada | variable | Múltiples |

La comparación cuantitativa con alternativas no puede completarse porque la información proporcionada no incluye los resultados del MLP de referencia ni de otras arquitecturas. La única comparación documentada es cualitativa: el IOC-NN comparte forma y ajustes con un MLP del mismo autor, lo que permite atribuir las diferencias de rendimiento a la restricción de convexidad.

## Limitaciones y advertencias

- Modelo académico sin licencia declarada: no se especifican condiciones de uso comercial, por lo que su reutilización en producción es jurídicamente incierta.
- Precisión limitada: 0,4786 en test, lejos de lo que se espera de una CNN moderna en CIFAR-10; no es adecuado para aplicaciones reales de clasificación.
- Sobreajuste evidente: 0,8365 de precisión en entrenamiento frente a 0,4786 en test, con un pico de test en la época 33 (0,5232) que decae después.
- Entrada restringida: solo acepta imágenes de 32×32×3 píxeles normalizadas con la media y desviación típica exactas de `preprocessing.npz`; cualquier otra resolución o distribución requiere reentrenamiento.
- Sin sesgos documentados sobre datos demográficos, pero CIFAR-10 contiene clases y sesgos propios del dataset que se heredan sin mitigación.
- Riesgo de alucinación no aplica (no genera texto), pero sí de calibración deficiente: los logits no están calibrados y no se incluye capa softmax en el `state_dict`.
- La restricción de convexidad limita la expresividad del modelo; no debe interpretarse como una ventaja de rendimiento, sino como una propiedad estructural objeto de estudio.
- Sin información sobre idiomas, tool calling, agentes ni capacidades multimodales: no es un modelo de lenguaje y no debe evaluarse como tal.
- Repositorio de 0,0 GB y sin descargas ni likes: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MadKane/smai-a4-iocnn-p0-torch
- Paper de referencia: Sivaprasad et al., *The Curious Case of Convex Neural Networks*, arXiv:2006.05103 — https://arxiv.org/abs/2006.05103
- Dataset CIFAR-10: https://huggingface.co/datasets/uoft-cs/cifar10
- No se han encontrado otros enlaces (blogs, repos, demos) en la información proporcionada.
