# anay345/smai-a4-iocnn

## Resumen

smai-a4-iocnn es un modelo de clasificación de imágenes para CIFAR-10 publicado en HuggingFace por el usuario anay345, presumiblemente como entrega de una practica academica de la asignatura SMAI (roll 2024102050). No es un modelo de lenguaje: se trata de un perceptron multicapa (MLP) de tres capas con arquitectura 3072-256-10 que recibe la imagen aplanada (32x32x3 = 3072 valores) y produce 10 logits correspondientes a las clases de CIFAR-10.

El modelo incorpora una restriccion poco habitual: los pesos de las capas a partir de la segunda se mantienen no negativos, aplicando la transformacion `exp(w-5)` a cualquier peso negativo tras cada paso de optimizacion. La activacion oculta es ELU y la salida se interpreta mediante softmax con perdida de entropia cruzada categorica.

Su relevancia es limitada fuera del ambito docente: alcanza una precision de test de 0,4994 (49,94 %) sobre CIFAR-10, un resultado modesto que queda lejos del estado del arte en ese benchmark (redes convolucionales y transformers de vision superan el 95 %). El repositorio esta vacio (0,0 GB), sin pesos publicados, sin licencia declarada y sin idiomas especificados, lo que impide su uso practico tal cual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MLP) denso, 3072-256-10 |
| Parametros totales | 789.770 (3072x256 + 256 + 256x10 + 10) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imagenes, entrada fija de 3072 valores) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de 0,0 GB, sin ficheros de pesos) |

## Arquitectura y entrenamiento

La red es un MLP completamente conectado con una capa de entrada de 3072 unidades (imagen RGB de 32x32 aplanada), una capa oculta de 256 neuronas con activacion ELU y una capa de salida de 10 logits con identidad seguida de softmax. La perdida es entropia cruzada categorica. La innovacion declarada es una restriccion de no negatividad sobre los pesos de las capas oculta y de salida: tras cada actualizacion, cualquier peso negativo se transforma mediante `exp(w-5)`, lo que fuerza el mantenimiento de pesos positivos y actua como una forma de regularizacion o de interpretabilidad estructural.

El entrenamiento usa SGD con learning rate 0,01, tamano de lote 64, sin acumulacion de gradientes, durante 100 epocas y con semilla 2050. Los datos son las 50.000 imagenes de entrenamiento de CIFAR-10 con etiquetas verdaderas (se indica `p=0`, probablemente sin etiquetas ruidosas). El preprocesado aplana la imagen HWC a 3072 valores, divide entre 255 y aplica normalizacion (resta de media y division por desviacion tipica) usando estadisticas guardadas en `preprocessing.npz`. No se menciona aumento de datos, validacion cruzada ni tecnicas de regularizacion adicionales (dropout, weight decay, batch norm).

## Capacidades

- Clasificacion de imagenes de 32x32 píxeles en las 10 clases de CIFAR-10 (avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco, camion).
- Inferencia sobre imagenes preprocesadas con el pipeline exacto descrito (aplanado, escalado a [0,1] y normalizacion con las estadisticas de `preprocessing.npz`).
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa lenguaje).
- No dispone de modo thinking, vision avanzada, audio ni ninguna capacidad multimodal mas alla de la clasificacion de imagenes de baja resolucion.

## Casos de uso

- Docencia y practicas academicas: el modelo sirve como ejemplo de MLP con restricciones sobre pesos para ilustrar el efecto de la no negatividad en el entrenamiento y en la precision final (49,94 %).
- Baseline de referencia en CIFAR-10: util para comparar arquitecturas mas complejas (CNN, ResNet, ViT) contra un MLP simple y cuantificar la mejora que aporta la convolucion.
- Estudio de regularizacion por restriccion de signo: permite analizar como la transformacion `exp(w-5)` afecta a la convergencia y a la capacidad expresiva de la red.
- Reproduccion de experimentos: con la semilla 2050, el learning rate 0,01 y el batch 64 documentados, es posible replicar el entrenamiento y verificar la precision reportada.
- Prototipado educativo de pipelines de vision: sirve para ensenar preprocesado (aplanado, normalizacion con media y desviacion tipica) y evaluacion con accuracy sobre un split de test.
- Clasificacion de imagenes de muy baja resolucion en entornos con recursos minimos: con menos de 800.000 parametros, el modelo puede ejecutarse en CPU sin requisitos de memoria apreciables, aunque con precision limitada.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| CIFAR-10 test accuracy | 0,4994 (49,94 %) | Reportado en la model card; 50.000 imagenes de test |

No se han publicado resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es linguistico y la model card solo reporta la precision en CIFAR-10.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en float32 (789.770 parametros x 4 bytes ≈ 3,2 MB, mas activaciones y buffers), despreciable en cualquier GPU.
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente. Funciona igualmente en GTX 1050, RTX 3060, RTX 4090, A100 o H100 sin aprovechar su capacidad.
- Cabe en cualquier GPU consumer, incluso en iGPU y en dispositivos embebidos.
- Opciones de despliegue: al no publicarse pesos, no es desplegable directamente. Si se reentrenara, bastaria NumPy, PyTorch o TensorFlow en CPU; no requiere vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles; por el tamano del modelo se espera latencia de microsegundos por imagen en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Precision CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smai-a4-iocnn | 789.770 | 3072 valores (32x32x3) | 49,94 % | no disponible | Repositorio vacio, sin pesos |
| MLP 3072-256-10 estandar (sin restriccion) | 789.770 | 3072 valores | no disponible en la informacion | no disponible | Referencia conceptual |
| ResNet-18 (CIFAR-10) | ~11,2 M | 32x32x3 | ~93-95 % (referencia habitual en la literatura) | varía segun implementacion | Ampliamente disponible |
| Vision Transformer (ViT) pequeno para CIFAR-10 | ~5-10 M | 32x32x3 con parches | ~90-99 % segun variante | varía segun implementacion | Ampliamente disponible |

La comparativa con ResNet-18 y ViT se ofrece como referencia de categoria (clasificacion CIFAR-10), no como medicion directa contra este modelo concreto; los valores de esos modelos son los habituales en la literatura y no se han verificado en la informacion proporcionada.

## Limitaciones y advertencias

- Precision baja: 49,94 % en CIFAR-10 implica que el modelo falla en aproximadamente la mitad de las imagenes de test; no es adecuado para produccion.
- Repositorio vacio: el tamano del repo es 0,0 GB y no se listan ficheros de pesos, por lo que no es posible cargar ni ejecutar el modelo tal como esta publicado.
- Licencia no declarada: no se especifica licencia, lo que impide determinar si el uso comercial esta permitido; en la practica, la ausencia de licencia implica reserva de derechos por defecto.
- Sin idiomas ni pipeline declarados: la model card no define pipeline de HuggingFace ni idiomas, lo que limita su integracion en el ecosistema `transformers`.
- Dependencia estricta del preprocesado: requiere el fichero `preprocessing.npz` con la media y desviacion tipica exactas usadas en entrenamiento; sin el, las predicciones no seran validas.
- Restriccion de pesos no negativos: puede limitar la capacidad expresiva de la red y contribuir a la precision moderada observada.
- Sin datos de sesgo o robustez: no se han publicado analisis de sesgos, robustez a perturbaciones ni evaluacion por clase, por lo que se desconoce el comportamiento diferencial entre categorias.
- Riesgo de sobreajuste no documentado: no se reporta precision de validacion ni curvas de entrenamiento, solo la precision de test final.
- Entrada fija: solo acepta imagenes de 32x32 píxeles RGB; no admite otras resoluciones sin reentrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anay345/smai-a4-iocnn
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
