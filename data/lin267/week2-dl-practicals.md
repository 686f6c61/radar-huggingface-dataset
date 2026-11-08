# lin267/week2-dl-practicals

## Resumen

`lin267/week2-dl-practicals` no es un modelo de lenguaje: es un repositorio didáctico que contiene la implementación completa de cuatro prácticas de un curso de fundamentos de deep learning, con código de entrenamiento, pesos entrenados, gráficas de resultados, métricas en JSON y una memoria de laboratorio. Lo publica el usuario `lin267` en Hugging Face bajo licencia MIT y con la etiqueta de idioma `zh`, dado que toda la documentación está en chino. El repositorio ocupa 0.0 GB y fue creado en noviembre de 2026.

El contenido abarca cuatro ejercicios independientes: ajuste de funciones con un MLP en sándwich (1→128→256→128→1, 66.305 parámetros), clasificación de dígitos MNIST con un MLP (784→64→10, 50.890 parámetros), con una CNN de dos capas convolucionales y dos de pooling (431.080 parámetros) y con modelos recurrentes LSTM (24.714 parámetros) y GRU (18.698 parámetros) sobre la imagen tratada como secuencia de 28 pasos. Todos los modelos se entrenaron durante 3 épocas con Adam (lr=1e-3) y batch de 64 sobre una NVIDIA RTX 4060 con PyTorch 2.5.1.

Su relevancia es exclusivamente formativa: sirve como referencia reproducible para quien quiera comparar el comportamiento de arquitecturas densas, convolucionales y recurrentes sobre un mismo conjunto de datos pequeño, y como ejemplo de empaquetado de prácticas docentes en el Hub. No debe evaluarse como un modelo desplegable en producción ni como base para tareas de NLP.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP (ajuste de funciones y MNIST), CNN (2 conv + 2 pool) y LSTM/GRU (secuencia de 28 pasos) |
| Parámetros totales | 66.305 (ajuste de funciones); 50.890 (MLP MNIST); 431.080 (CNN MNIST); 24.714 (LSTM); 18.698 (GRU) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la LSTM/GRU procesa secuencias de 28 pasos de 28 dimensiones) |
| Tipos de cuantizacion | no disponible (pesos en `state_dict` de PyTorch, sin versiones cuantizadas publicadas) |
| Idiomas soportados | chino (`zh`) en la documentación; los modelos no procesan texto |
| Licencia | MIT |
| Formato de pesos | `state_dict` de PyTorch (`.pt`) |

## Arquitectura y entrenamiento

Las cuatro prácticas comparten una filosofía deliberadamente minimalista. El ajuste de funciones usa un perceptrón multicapa con cuatro capas lineales (1→128→256→128→1) separadas por ReLU, entrenado como regresión con error cuadrático medio. Los dos clasificadores de MNIST son un MLP de una capa oculta (784→64→10) y una CNN con `Conv2d(1,20,5)` + ReLU + MaxPool(2), seguida de `Conv2d(20,50,5)` + ReLU + MaxPool(2) y una cabeza densa `Linear(800,500)` → ReLU → `Linear(500,10)`. El cuarto ejercicio aplana cada imagen en 28 pasos de 28 dimensiones y aplica una LSTM o una GRU con `hidden=64` y `batch_first=True`, tomando la última salida de la secuencia antes de una capa lineal a 10 clases.

El entrenamiento es idéntico en los tres casos de MNIST: 3 épocas, optimizador Adam con tasa de aprendizaje 1e-3, tamaño de lote 64 y semilla fija (`seed=42`) para garantizar reproducibilidad. El conjunto de datos es `mnist.pkl.gz` con 50.000 muestras de entrenamiento, 10.000 de validación y 10.000 de prueba, descargado automáticamente con direcciones espejo de respaldo. No hay fases de RLHF, DPO ni ajuste fino adicional: son modelos entrenados desde cero con aprendizaje supervisado estándar. La única innovación destacable es metodológica, no arquitectónica: el repositorio incluye un script de comparación entre los cuatro modelos y otro que recarga los pesos para reverificar la precisión.

## Capacidades

- Clasificación de imágenes en escala de grises de 28×28 píxeles en 10 clases (dígitos 0-9) mediante el MLP, la CNN, la LSTM y la GRU.
- Regresión de funciones escalares univariantes con el MLP en sándwich (MSE de 0.0022 en el conjunto de prueba).
- Extracción de características espaciales jerárquicas con la CNN (dos etapas de convolución y reducción de resolución).
- Modelado de dependencias secuenciales con LSTM y GRU tratando la imagen como una secuencia de filas.
- Comparación controlada de arquitecturas sobre un mismo dataset y una misma configuración de entrenamiento.
- Carga y reverificación de pesos mediante `load_state_dict`, con un script de demostración dedicado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni modo de pensamiento extendido.
- No tiene capacidades multilingües ni de generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Docencia de fundamentos de deep learning: el repositorio permite al alumnado ejecutar cuatro arquitecturas canónicas con semilla fija y comparar resultados sin escribir el código desde cero, gracias a los scripts numerados y al `run_all.ps1` de ejecución completa.
- Estudio comparativo de inductivos sesgos: la CNN alcanza 98.98% con 431.080 parámetros y 3 épocas, frente al 95.83% del MLP con 50.890 parámetros, lo que ilustra de forma cuantitativa la ventaja de preservar la estructura espacial.
- Análisis de eficiencia paramétrica: la GRU obtiene 96.06% con 18.698 parámetros, un 37% de los parámetros del MLP, y aun así supera su precisión; útil para discutir cuándo el tamaño no determina el rendimiento.
- Validación de pipelines de entrenamiento: los scripts `mnist_common.py` y `06_load_weights_demo.py` sirven como plantilla para verificar que un entorno con PyTorch 2.5.1 y CUDA 11.8 reproduce exactamente las métricas publicadas.
- Referencia para pruebas de regresión de código: al estar los pesos en formato `state_dict` y las métricas en JSON, se puede usar como caso de prueba para comprobar que una actualización de PyTorch no altera la inferencia.
- Material de partida para extensiones didácticas: el documento `学习指引-四个实战.md` incluye ejercicios de ampliación, de modo que el repositorio sirve como base para prácticas posteriores (por ejemplo, sustituir la GRU por atención o aumentar épocas hasta la saturación de la validación).
- Demostración de empaquetado reproducible en el Hub: muestra cómo publicar pesos, código, resultados y memoria en un único repositorio con licencia MIT y estructura clara.

## Benchmarks y rendimiento

| Práctica | Modelo | Parámetros | Métrica | Resultado |
|---|---|---|---|---|
| Ajuste de funciones | MLP 1→128→256→128→1 | 66.305 | MSE (test) | 0.0022 |
| MNIST | MLP 784→64→10 | 50.890 | Accuracy (test) | 95.83% |
| MNIST | CNN 2 conv + 2 pool | 431.080 | Accuracy (test) | 98.98% |
| MNIST | LSTM (hidden=64) | 24.714 | Accuracy (test) | 96.18% |
| MNIST | GRU (hidden=64) | 18.698 | Accuracy (test) | 96.06% |

Todos los resultados de MNIST corresponden a 3 épocas de entrenamiento con Adam (lr=1e-3) y batch de 64. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Entrenamiento realizado en una NVIDIA RTX 4060 con PyTorch 2.5.1 y CUDA 11.8; los cinco modelos son lo bastante pequeños para entrenarse en cualquier GPU consumer con al menos 4 GB de VRAM.
- Inferencia en CPU perfectamente viable: el modelo más grande (CNN, 431.080 parámetros) ocupa del orden de 1,7 MB en `float32`, y el más pequeño (GRU, 18.698 parámetros) unos 75 KB.
- GPU recomendadas: ninguna en particular; una RTX 3060, RTX 4060 o superior acelera el entrenamiento, pero no es necesaria. A100 o H100 no aportan ventaja apreciable a esta escala.
- Cabe en cualquier GPU consumer, incluida una GTX 1650 de 4 GB, y también en Raspberry Pi para inferencia.
- Opciones de despliegue: PyTorch nativo con `state_dict`; no se proporcionan artefactos para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelos.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, la inferencia por muestra es del orden de microsegundos a milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Precisión MNIST | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| lin267/week2-dl-practicals (CNN) | CNN didáctica | 431.080 | no aplica | 98.98% (3 épocas) | MIT | Hugging Face |
| lin267/week2-dl-practicals (GRU) | RNN didáctica | 18.698 | 28 pasos | 96.06% (3 épocas) | MIT | Hugging Face |
| Vinay18-sng/DL-AI-Internship week2 | Cuaderno de prácticas | no disponible | no aplica | no disponible | no disponible | GitHub |
| LeNet-5 (referencia histórica) | CNN | ~60.000 | no aplica | ~99% con entrenamiento completo | dominio público (arquitectura) | múltiples implementaciones |

La comparación con modelos de lenguaje no procede: este repositorio no compite en la categoría de modelos generativos. Frente a otras prácticas docentes de MNIST, su valor diferencial es la combinación de cuatro arquitecturas bajo una configuración idéntica y la publicación de pesos y métricas verificables.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas y no admite instrucciones en lenguaje natural.
- El dominio es exclusivamente MNIST (dígitos manuscritos en escala de grises de 28×28) y una función escalar sintética; no generaliza a otras imágenes ni a otros problemas.
- Solo 3 épocas de entrenamiento: los resultados no representan el techo de cada arquitectura y no deben citarse como cifras de referencia del estado del arte.
- Los pesos son `state_dict` que requieren instanciar la clase del modelo correspondiente; no hay `AutoModel` ni `pipeline` de Transformers, por lo que la integración con el ecosistema estándar es manual.
- Los scripts de `code/` empiezan por dígito y no se pueden importar directamente; hay que recurrir a `importlib`, lo que complica su reutilización en otros proyectos.
- La documentación está íntegramente en chino, lo que limita su uso a lectores de ese idioma o a quienes recurran a traducción automática.
- Riesgo de alucinación no aplicable; el riesgo real es de sobreinterpretación: las cifras de precisión corresponden a un dataset saturado y no son extrapolables a producción.
- Licencia MIT: permite uso comercial y modificación con atribución, pero el dataset MNIST conserva la licencia de sus autores originales (LeCun et al.), que debe respetarse por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay garantía de mantenimiento ni de soporte por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lin267/week2-dl-practicals
- Perfil del autor: https://huggingface.co/lin267
- Cuaderno de prácticas relacionado (GitHub): https://github.com/Vinay18-sng/DL-AI-Internship/blob/main/week2/week%202.ipynb
- Repositorio de otro modelo del mismo autor (PPO LunarLander): https://huggingface.co/lin267/ppo-LunarLander-v3
