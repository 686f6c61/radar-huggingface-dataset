# AmeerSayyad/smai-a4-numpy-mlp

## Resumen

`smai-a4-numpy-mlp` es un perceptrón multicapa (MLP) de tres capas (3072-64-10 con activación ReLU) con 197.322 parámetros, entrenado desde cero sobre CIFAR-10 como parte de la asignación 4 de la asignatura SMAI (Statistical Methods for AI). No es un modelo fundacional ni un modelo de lenguaje: es un artefacto académico que publica los pesos de un clasificador de imágenes de 32x32 píxeles en 10 clases, implementado en NumPy y, en paralelo, en PyTorch.

El autor lo publica como evidencia reproducible de dos experimentos: el MLP seleccionado en la pregunta 1.2.5 (partición estratificada 3600/1200/1200, learning rate 0,01, batch 64, early stopping) con una accuracy de validación de 0,4881 y de test de 0,4918; y el MLP de PyTorch comparado con una red IOC-NN en la pregunta 1.5 (entrenamiento sobre 50.000 imágenes con etiquetas reales, 100 épocas) con una accuracy de test de 0,4529.

Su relevancia es exclusivamente pedagógica y de referencia: sirve como línea base mínima frente a CNN y como ejemplo de implementación de forward/backward sin frameworks de alto nivel. No debe evaluarse como un modelo desplegable en producción: la información disponible no incluye licencia, idiomas ni pipeline, y el repositorio ocupa 0,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP totalmente conectado 3072-64-10 con activación ReLU (2 capas densas: 3072→64 y 64→10) |
| Parametros totales | 197.322 (196.608 en W1 + 64 en b1 + 640 en W2 + 10 en b2) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada fija de 3072 valores (imagen RGB 32x32 aplanada) |
| Tipos de cuantizacion | no disponible; pesos publicados en coma flotante dentro de `.npz`, sin variantes cuantizadas |
| Idiomas soportados | no aplica (clasificador de imágenes); etiquetas de clase en inglés |
| Licencia | no disponible |
| Formato de pesos | `.npz` (NumPy) con claves `W{i}` de forma `(n_in, n_out)` y `b{i}` de forma `(n_out,)`, más `.json` con metadatos del experimento |

## Arquitectura y entrenamiento

La arquitectura es un MLP de dos transformaciones afines con ReLU entre ellas y salida de 10 logits (una por clase de CIFAR-10: airplane, automobile, bird, cat, deer, dog, frog, horse, ship, truck). No hay convoluciones, atención, normalización por lotes ni conexiones residuales: cada píxel se trata como una dimensión independiente tras aplanar la imagen a 3072 valores. El preprocesado documentado consiste en aplanar, dividir entre 255 y estandarizar cada columna con la media y la desviación típica de la partición de entrenamiento correspondiente.

El experimento NumPy (1.2.5) usa una partición estratificada de 3600/1200/1200 ejemplos, learning rate 0,01, batch de 64 y early stopping, y alcanza 0,4881 en validación y 0,4918 en test. El experimento PyTorch (1.5) usa 50.000 imágenes con etiquetas reales (p = 0) durante 100 épocas y obtiene 0,4529 en test. No se documenta en la información disponible el número total de tokens/pasos, la función de pérdida exacta (presumiblemente entropía cruzada), el optimizador, ni si hubo aumento de datos, regularización L2 o dropout. No hay RLHF, DPO ni ajuste por preferencias: es entrenamiento supervisado puro sobre un subconjunto de CIFAR-10. La semilla declarada es 1040.

## Capacidades

- Clasificación de imágenes de 32x32 píxeles en RGB en exactamente 10 clases de CIFAR-10; la salida es un vector de 10 logits.
- Inferencia en NumPy puro a partir de los pesos `.npz`, sin dependencia de PyTorch ni de ningún framework de deep learning.
- Reproducción determinista del experimento (semilla 1040 declarada) para validación de resultados académicos.
- Comparación controlada NumPy frente a PyTorch con la misma topología (197.322 parámetros en ambos casos).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general, audio ni modo "thinking".
- No soporta diálogo multi-turno ni instrucciones en lenguaje natural: no es un modelo de lenguaje.
- No admite imágenes de resolución distinta de 32x32 ni canales distintos de RGB sin reentrenamiento.

## Casos de uso

- Docencia de retropropagación: el par de ficheros `numpy_mlp_selected.npz` y su `.json` permiten reproducir el entrenamiento paso a paso y comparar el gradiente calculado a mano con el de PyTorch, con una métrica de referencia concreta (0,4918 en test).
- Línea base mínima en experimentos con CIFAR-10: sirve para cuantificar cuánto aporta una CNN frente a un MLP sin estructura espacial, usando la accuracy de test de 0,4918 como suelo de comparación bajo la misma partición 3600/1200/1200.
- Validación de pipelines de preprocesado: el modelo solo funciona si se aplica exactamente el aplanado, la división entre 255 y la estandarización por columna con media y desviación típica del conjunto de entrenamiento; es un test de integración útil para verificar que un pipeline de datos replica esas transformaciones.
- Inferencia en CPU y entornos sin GPU: con 197.322 parámetros (unos 0,79 MB en float32), el modelo se carga en memoria y clasifica lotes de imágenes 32x32 en un portátil o en un contenedor ligero, útil para demos y pruebas de humo de servicios de clasificación.
- Estudio de reproducibilidad NumPy frente a PyTorch: la diferencia entre 0,4918 (NumPy, 1200 ejemplos de entrenamiento) y 0,4529 (PyTorch, 50.000 ejemplos) permite analizar el efecto de la partición y de la implementación en el resultado final.
- Análisis de errores por clase: al ser un clasificador de 10 clases con ~49 % de accuracy, es un caso de estudio manejable para construir matrices de confusión y discutir confusión entre clases visualmente similares (cat/dog, automobile/truck) sin coste computacional.
- Verificación de empaquetado de artefactos: el formato `.npz` con claves `W{i}`/`b{i}` sirve como ejemplo de serialización de pesos para probar cargadores propios, control de versiones de artefactos o tests de compatibilidad de formatos.

## Benchmarks y rendimiento

| Benchmark | Modelo / configuracion | Resultado |
|---|---|---|
| CIFAR-10 test accuracy | MLP NumPy (1.2.5), split 3600/1200/1200, semilla 1040 | 0,4918 |
| CIFAR-10 validation accuracy | MLP NumPy (1.2.5) | 0,4881 |
| CIFAR-10 test accuracy | MLP PyTorch (1.5), 50.000 imagenes, 100 epocas | 0,4529 |
| CIFAR-10 test accuracy | Azar uniforme sobre 10 clases | 0,10 (referencia teorica) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de lenguaje, razonamiento o código; el modelo no es capaz de ejecutarlos. Tampoco se publican métricas desagregadas por clase, precisión/recall, matriz de confusión ni curvas de entrenamiento.

## Requisitos de hardware

- VRAM: no aplica. El modelo (197.322 parámetros × 4 bytes ≈ 0,79 MB en float32) se ejecuta íntegramente en CPU y en RAM convencional.
- GPU recomendadas: ninguna necesaria. Cualquier GPU sirve para entrenar variantes, pero el cuello de botella es el bucle en Python/NumPy, no la memoria de vídeo.
- GPU de consumo: cabe holgadamente en cualquier iGPU o CPU moderna; no requiere GPU dedicada. Para el entrenamiento documentado (3600 ejemplos, early stopping) es viable en CPU en tiempos del orden de minutos.
- Opciones de despliegue: no hay soporte de vLLM, TGI, llama.cpp ni Ollama, porque no es un modelo autorregresivo. El despliegue se hace cargando el `.npz` con `numpy.load` y aplicando dos productos matriciales con ReLU intermedia.
- Latencia y throughput: no publicados. Por cómputo, el forward son ~197.000 MACs por imagen, lo que en CPU moderna sitúa la inferencia en el orden de microsegundos por imagen y permite lotes de miles de imágenes por segundo; son estimaciones analíticas, no medidas por el autor.
- Almacenamiento: el repositorio declara 0,0 GB; los pesos en float32 ocupan menos de 1 MB, más los ficheros `.json` de metadatos.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada / tarea | Accuracy test CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AmeerSayyad/smai-a4-numpy-mlp | 197.322 | 32x32x3, 10 clases | 0,4918 (NumPy) / 0,4529 (PyTorch) | no disponible | HuggingFace |
| AmeerSayyad/smai-a4-ioc-nn | no disponible | 32x32x3, 10 clases (IOC-NN) | no disponible | no disponible | HuggingFace (referenciado por el autor) |
| Aakarsh14/smai-a4-mlp | no disponible | 32x32x3, 10 clases | no disponible | no disponible | HuggingFace (misma asignación SMAI, tarea 1.4.2) |
| CNN típica sobre CIFAR-10 | no disponible | 32x32x3, 10 clases | no disponible en la información proporcionada | no disponible | — |

La comparación cuantitativa fiable se limita a la diferencia interna NumPy/PyTorch. Para el resto de alternativas no hay métricas publicadas en la información disponible, por lo que no procede establecer un ranking.

## Limitaciones y advertencias

- Es un artefacto académico de una asignatura, no un modelo mantenido ni validado para producción; no hay garantía de soporte, versionado semántico ni corrección de errores.
- Licencia no declarada: sin licencia explícita no hay permiso claro de uso comercial, redistribución ni obra derivada. Es un bloqueo legal para cualquier integración en producto.
- Rendimiento bajo en términos absolutos: 0,4918 de accuracy en test sobre 10 clases deja aproximadamente la mitad de las imágenes mal clasificadas; cualquier CNN razonable supera ampliamente este resultado.
- Ausencia de estructura espacial: al aplanar la imagen, el MLP no explota la localidad de los píxeles, lo que explica en parte su techo de rendimiento y su sensibilidad a traslaciones.
- Riesgo de sobreajuste: la partición de 1200 ejemplos de validación y 1200 de test es pequeña, por lo que la diferencia entre 0,4881 (validación) y 0,4918 (test) no es estadísticamente concluyente.
- Sin información sobre sesgos: no se documenta composición del dataset más allá de CIFAR-10 ni análisis de sesgo por clase, subgrupo o atributo.
- Dominio cerrado: solo acepta imágenes 32x32x3 y devuelve 10 clases; no generaliza a otras resoluciones, otros datasets ni a texto.
- Dependencia estricta del preprocesado: la estandarización usa la media y desviación típica de la partición de entrenamiento concreta; aplicar otra normalización degrada el resultado sin aviso.
- Metadatos inconsistentes: la fecha de creación declarada en HuggingFace es 2026-10-24, posterior a la fecha habitual de consulta, y el repositorio figura con 0,0 GB; conviene verificar la integridad de los ficheros antes de reutilizarlos.
- No hay model card técnica con detalles de optimizador, función de pérdida, número de épocas efectivas ni curvas de aprendizaje, lo que limita la reproducibilidad fina.
- No es un modelo de lenguaje: no admite prompts, instrucciones, tool calling ni razonamiento multi-paso; cualquier expectativa en ese sentido es un error de categoría.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AmeerSayyad/smai-a4-numpy-mlp
- IOC-NN del mismo autor (comparado en la pregunta 1.5): https://huggingface.co/AmeerSayyad/smai-a4-ioc-nn
- Modelo de la misma asignación (Aakarsh14): https://huggingface.co/Aakarsh14/smai-a4-mlp
- Listado de modelos etiquetados como `smai-assignment`: https://huggingface.co/models?other=smai-assignment
