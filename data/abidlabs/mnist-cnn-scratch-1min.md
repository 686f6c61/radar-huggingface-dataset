# abidlabs/mnist-cnn-scratch-1min

## Resumen

mnist-cnn-scratch-1min es una red neuronal convolucional (CNN) de tipo feed-forward entrenada desde cero sobre el conjunto de datos MNIST para clasificar dígitos manuscritos en escala de grises de 28×28 píxeles. Lo publica el usuario abidlabs en HuggingFace y su rasgo definitorio no es la precisión ni el tamaño, sino el coste de entrenamiento: la model card declara 911 pasos de entrenamiento (batch de 128, optimizador Adam con lr=1e-3) completados en aproximadamente 60 segundos de tiempo de reloj sobre una instancia `cpu-basic` con 2 vCPU. El resultado reportado es un 98,31 % de exactitud en el conjunto de test.

La arquitectura es deliberadamente mínima y está descrita de forma completa en la model card: Conv(1→32, 3×3) → ReLU → MaxPool → Conv(32→64, 3×3) → ReLU → MaxPool → Flatten → Linear(3136→128) → ReLU → Linear(128→10). No utiliza normalización por lotes, dropout, aumento de datos ni scheduler de tasa de aprendizaje. A partir de las dimensiones declaradas se puede calcular un total de aproximadamente 421.642 parámetros (0,42 M), lo que sitúa el modelo tres órdenes de magnitud por debajo de cualquier LLM y lo hace ejecutable en cualquier CPU moderna.

Su relevancia es por tanto instrumental y no de producto: sirve como referencia reproducible de "qué se puede conseguir con un minuto de cómputo barato", como caso de prueba para infraestructura de entrenamiento y despliegue, y como material didáctico. El repositorio ocupa 0,0 GB, no tiene descargas ni likes registrados en el momento de la consulta, y no declara licencia ni idiomas.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN secuencial: Conv(1→32, 3×3) → ReLU → MaxPool → Conv(32→64, 3×3) → ReLU → MaxPool → Flatten → Linear(3136→128) → ReLU → Linear(128→10) |
| Parámetros totales | ≈421.642 (0,42 M), calculado a partir de las dimensiones de capa indicadas en la model card |
| Parámetros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No aplica: la entrada es una imagen fija de 28×28 píxeles en un canal |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible; el modelo opera sobre imágenes, no sobre texto |
| Licencia | No disponible |
| Formato de pesos | No disponible (la etiqueta del repositorio es `pytorch`; el tamaño del repo figura como 0,0 GB) |
| Tarea | Clasificación de imágenes multiclase (10 clases: dígitos 0-9) |
| Entrada | Imagen 28×28×1, escala de grises |
| Salida | Vector de 10 logits (una clase por dígito) |
| Dataset de entrenamiento | MNIST (no se especifica en la model card la partición exacta utilizada más allá del conjunto de test reportado) |
| Repositorio (tamaño) | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Se trata de una CNN convolucional clásica de dos bloques. Cada bloque aplica una convolución 3×3 seguida de ReLU y un max pooling; tras el aplanado se obtiene un vector de 3136 elementos (64 canales × 7 × 7) que alimenta una capa densa de 128 unidades con activación ReLU, y finalmente una capa lineal de 10 salidas correspondiente a las clases del dataset. No hay mecanismos de atención, recurrencia, estado (SSM) ni componentes de mezcla de expertos. Es un transformer no, sino el paradigma convolucional pre-2017 aplicado al problema canónico de visión por computador.

El entrenamiento se realizó desde cero (sin pesos preentrenados ni transferencia) con Adam, tasa de aprendizaje 1e-3, tamaño de lote 128 y un total de 911 pasos, completados en unos 60 segundos de tiempo de reloj sobre `cpu-basic` (2 vCPU). La model card no documenta el uso de RLHF, DPO ni ningún otro ajuste posterior, lo cual es coherente con una tarea de clasificación supervisada. Tampoco se menciona normalización por lotes, dropout, aumento de datos ni scheduler, lo que explica en parte que la exactitud reportada (98,31 %) quede por debajo de las cifras superiores al 99 % que se citan habitualmente cuando se incorporan esas técnicas. La curva de pérdida es pública a través del space `abidlabs/mnist-cnn-scratch-1min-trackio` y los registros de ejecución están enlazados desde la model card.

## Capacidades

- Clasificación de dígitos manuscritos en imágenes de 28×28 píxeles en escala de grises, con 10 clases de salida (0 a 9).
- Inferencia sobre CPU: el entrenamiento completo cupo en 2 vCPU, por lo que la inferencia no requiere acelerador.
- Entrenamiento reproducible de extremo a extremo en aproximadamente un minuto, con hiperparámetros documentados en la model card.
- Exportación potencial a formatos de despliegue habituales de PyTorch (TorchScript, ONNX) como paso manual, no documentado por el autor.
- No dispone de generación de texto ni de lenguaje natural.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente, planificación ni razonamiento en varios pasos.
- No dispone de capacidades multilingües en sentido textual; el dominio se limita a numerales arábigos escritos a mano.
- No dispone de modo de razonamiento (thinking mode), visión general, audio ni multimodalidad.

## Casos de uso

- Línea base para experimentos de eficiencia de entrenamiento: sirve como referencia de "qué exactitud se obtiene con un presupuesto fijo de cómputo" (911 pasos, 2 vCPU, ~60 s). Es útil para comparar técnicas de optimización, aumento de datos o inicialización sin necesidad de GPU.
- Prueba de humo (smoke test) en pipelines de MLOps: por su coste de entrenamiento de un minuto, encaja en integración continua para verificar que un stack de PyTorch, el registro de experimentos (en este caso Trackio) y el almacenamiento de artefactos funcionan de extremo a extremo antes de lanzar trabajos costosos.
- Módulo de reconocimiento de dígitos en formularios escaneados: como componente de un pipeline de OCR, puede clasificar recortes de campos numéricos (importes, cantidades, códigos postales) cuando el preprocesado ya ha aislado y normalizado cada dígito a 28×28.
- Lectura de dígitos en documentos y recibos: clasificación de caracteres individuales en un flujo de digitalización por etapas, donde el modelo actúa como clasificador de carácter tras la segmentación.
- Material docente y de laboratorio: ejemplo mínimo y autocontenido de CNN con arquitectura explícita y curva de pérdida pública, adecuado para demostrar el efecto de añadir normalización por lotes, dropout o aumento de datos frente a los resultados reportados.
- Validación de despliegues de inferencia: modelo de 0,42 M de parámetros que permite probar servicios de inferencia (TorchServe, ONNX Runtime, FastAPI con PyTorch) sin consumir recursos significativos, verificando latencias y contratos de API.
- Filtrado previo en conjuntos de datos documentales: descartar o etiquetar regiones de imagen que contienen o no dígitos antes de aplicar un modelo mayor y más costoso.

## Benchmarks y rendimiento

| Benchmark | Resultado | Condiciones |
|---|---|---|
| MNIST (exactitud de test) | 98,31 % | 911 pasos, batch 128, Adam lr=1e-3, ~60 s de entrenamiento en `cpu-basic` (2 vCPU) |

No se han publicado en la información disponible resultados para otros benchmarks (por ejemplo, variantes de MNIST, Fashion-MNIST, CIFAR-10 ni métricas de latencia o throughput de inferencia).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Con 421.642 parámetros en float32, los pesos ocupan aproximadamente 1,6 MiB (cálculo derivado del recuento de parámetros), por lo que el cuello de botella es la propia activación de la imagen, no el modelo.
- GPU recomendadas: no se requiere GPU. Cualquier GPU consumer (GTX 10xx o superior, RTX 3060/4090, etc.) es sobredimensionada para esta carga.
- Cabe en GPU consumer: sí, con enorme margen, y también en CPU de gama baja. El entrenamiento completo, que es la carga más exigente, se completó en 2 vCPU.
- Entrenamiento: `cpu-basic` con 2 vCPU, ~60 s de tiempo de reloj según la model card.
- Opciones de despliegue: PyTorch nativo es la vía documentada por la etiqueta del repositorio; TorchScript, ONNX Runtime, TorchServe o un servicio FastAPI son alternativas viables, aunque no están documentadas por el autor. No hay indicios de soporte en vLLM, llama.cpp, Ollama ni TGI, que son herramientas orientadas a modelos de lenguaje.
- Latencia y throughput estimados: no disponible. No se publican mediciones de latencia ni de peticiones por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Exactitud MNIST | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mnist-cnn-scratch-1min | ≈0,42 M | 28×28×1 | 98,31 % (test) | No disponible | HuggingFace (0 descargas, 0 likes) |
| CNN MNIST con normalización por lotes, dropout, aumento de datos y scheduler | No disponible | 28×28×1 | Objetivo declarado superior al 99 % en los laboratorios citados en la búsqueda (no verificado de forma independiente) | No disponible | Material docente en Google Colab |
| abidlabs/mnist-cnn-test | No disponible | No disponible | No disponible | No disponible | HuggingFace |
| LeNet-5 (referencia histórica) | No disponible en las fuentes consultadas | 32×32×1 | No disponible en las fuentes consultadas | No disponible | Referencia académica |

La comparación cuantitativa es limitada porque ninguna de las alternativas localizadas publica una model card con parámetros, licencia y métricas verificables en el mismo formato. La diferencia funcional más relevante frente a las soluciones con regularización es que este modelo no emplea normalización por lotes ni aumento de datos, lo que se traduce en una exactitud inferior a cambio de un entrenamiento extremadamente corto y reproducible.

## Limitaciones y advertencias

- Alcance funcional muy reducido: solo clasifica dígitos manuscritos en imágenes de 28×28 en escala de grises. No procesa texto, no genera contenido y no realiza ninguna otra tarea.
- No incorpora aumento de datos ni normalización por lotes, por lo que la exactitud de 98,31 % es sensible a cambios en la distribución de entrada: rotaciones, traslaciones, escalas distintas, ruido, trazos gruesos o colores invertidos pueden degradar el rendimiento sin que exista documentación sobre su robustez.
- Sesgo de dominio: MNIST está compuesto mayoritariamente por dígitos manuscritos de origen estadounidense (Censo y estudiantes de secundaria). El comportamiento sobre escritura de otras regiones, alfabetos numerales alternativos o caligrafías atípicas no está documentado y previsiblemente será peor.
- Riesgo de sobreajuste al conjunto de test en la comunicación de resultados: la model card no detalla la partición de entrenamiento ni el protocolo de evaluación, ni si se realizó selección de modelo con el conjunto de test.
- Licencia no declarada: al no especificarse licencia, el uso comercial queda en un limbo legal. Se debe contactar con el autor antes de utilizarlo en producción.
- Sin garantías de mantenimiento: 0 descargas, 0 likes y ausencia de pipeline declarado. No hay indicios de soporte, versionado ni actualizaciones posteriores.
- Sin datos de latencia, throughput, consumo de memoria ni pruebas de estrés, lo que impide dimensionar un despliegue en producción con cifras fiables.
- No es un modelo de lenguaje: no admite instrucciones en lenguaje natural, no soporta tool calling, agentes, contexto conversacional ni multilingüismo textual.
- Advertencia sobre la propia model card: describe un experimento de un minuto; la reproducibilidad puede depender de la versión de PyTorch, de la semilla aleatoria y del hardware concreto, ninguno de los cuales se especifica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abidlabs/mnist-cnn-scratch-1min
- Space con la curva de pérdida de entrenamiento (Trackio): https://huggingface.co/spaces/abidlabs/mnist-cnn-scratch-1min-trackio
- Registros de la ejecución de entrenamiento: https://huggingface.co/jobs/abidlabs/6ab594d26b030d633f68f6c0
- Modelo relacionado del mismo autor: https://huggingface.co/abidlabs/mnist-cnn-test
- Laboratorio docente con CNN sobre MNIST (normalización por lotes, dropout, aumento de datos y scheduler): https://colab.research.google.com/github/SattamAltwaim/KGSP_Emerging_Technologies_2026/blob/main/week2/labs/Day2_Lab1_CNN_MNIST_solved.ipynb
- Versión sin resolver del mismo laboratorio: https://colab.research.google.com/github/SattamAltwaim/KGSP_Emerging_Technologies_2026/blob/main/week2/labs/Day2_Lab1_CNN_MNIST.ipynb
- Implementación de CNN sobre MNIST sin PyTorch: https://github.com/yawen-d/MNIST-with-CNN-from-Scratch
- Implementación de red neuronal desde cero para MNIST: https://github.com/joohei/mnist-from-scratch
