# iishita1/EEGNetv4

## Resumen

EEGNetv4 es una colección de 12 redes neuronales convolucionales entrenadas para la decodificación de imaginería motora a partir de señales EEG. El modelo subyacente es EEGNetv4, propuesto originalmente por Lawhern et al. (2018) y reimplementado en la librería Braindecode. Cada uno de los 12 checkpoints se ha entrenado sobre un dataset distinto de la librería MOABB, todos ellos dentro del paradigma de motor imagery, lo que permite disponer de pesos preentrenados para múltiples cohortes y protocolos experimentales de BCI (interfaz cerebro-computador).

El repositorio, publicado por el usuario iishita1, recoge tanto los pesos como los resultados de evaluación y las capacidades de transferencia entre datasets. Por su naturaleza, no es un modelo de lenguaje: es un clasificador de señales EEG de tamaño muy reducido (en el orden de miles de parámetros según la configuración estándar de EEGNetv4) y con una ventana de entrada definida por la longitud temporal de las épocas EEG, no por un contexto de tokens.

Su relevancia actual reside en la escasez de pesos preentrenados abiertos para BCI basados en EEG y en la utilidad de estos checkpoints como punto de partida para transfer learning en nuevos sujetos y montajes. La licencia MIT y el formato de pesos en pickle (compatible con PyTorch y Braindecode) facilitan su reutilización en investigación y en prototipos clínicos o de neurotecnología.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EEGNetv4 (CNN compacta con convoluciones temporales y espaciales separables, depthwise y separable) |
| Parametros totales | no disponible (depende de la configuración; la variante estándar de EEGNetv4 es del orden de miles de parámetros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada EEG con longitud temporal definida por la época; no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de señales EEG, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | pickle de PyTorch (.pkl) con `kwargs` y `model-params` |

## Arquitectura y entrenamiento

EEGNetv4 es una red convolucional diseñada específicamente para clasificación de EEG. Combina una convolución temporal seguida de una convolución depthwise espacial y una convolución separable, con normalización por lotes y pooling medio. La configuración por defecto en Braindecode incluye `F1=8`, `D=2`, `F2=16`, `kernel_length=64`, `third_kernel_size=(8, 4)` y `drop_prob=0.25`, lo que da lugar a un modelo muy ligero y con pocos parámetros, adecuado para entrenamiento con datasets pequeños y para despliegue en dispositivos de bajo consumo.

Cada uno de los 12 checkpoints se ha entrenado sobre un dataset distinto de la lista de motor imagery de MOABB, siguiendo el procedimiento descrito en el póster y en el artículo *Transfer Learning between Motor Imagery datasets using Deep Learning*. El autor documenta evaluación de transferencia entre datasets, comparando el rendimiento en los mismos datasets usados para entrenamiento. No se especifican en la información disponible el número de épocas, la composición exacta de los sujetos ni si se aplicaron técnicas de aumento de datos o regularización adicionales más allá del dropout configurado.

## Capacidades

- Clasificación de imaginería motora a partir de épocas EEG multicanal.
- Decodificación de clases motoras (por ejemplo, mano izquierda, mano derecha, pies, lengua, según el dataset).
- Transferencia entre datasets y sujetos mediante reutilización de pesos preentrenados.
- Entrenamiento e inferencia en PyTorch a través de Braindecode.
- Modelo ligero apto para experimentación con pocos recursos computacionales.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües ni de visión, audio o modalidades distintas del EEG.

## Casos de uso

- Investigación en BCI: servir como baseline preentrenado para comparar nuevas arquitecturas de decodificación de imaginería motora sobre los mismos datasets de MOABB.
- Transfer learning entre sujetos: reutilizar los pesos de un checkpoint entrenado en una cohorte para inicializar un modelo en un nuevo sujeto con pocas épocas etiquetadas.
- Prototipos de neurotecnología: integrar el clasificador en un pipeline de adquisición EEG en tiempo real para demostrar control de una interfaz antes de invertir en modelos mayores.
- Evaluación de pipelines de preprocesado: usar los 12 checkpoints para medir cómo afectan distintas técnicas de filtrado, referencia o segmentación al rendimiento de decodificación.
- Docencia y formación: emplear modelos pequeños y rápidos de entrenar para ilustrar el flujo completo de un experimento de motor imagery con Braindecode y MOABB.
- Detección temprana en contextos clínicos experimentales: según la literatura citada, variantes de EEGNetv4 se han evaluado en cribado de demencia con EEG, lo que sugiere su uso como componente en estudios piloto de marcadores neurofisiológicos.
- Benchmarking de hardware: al ser un modelo de muy bajo coste computacional, sirve para validar cadenas de despliegue en dispositivos embebidos o de borde antes de portar modelos más pesados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye una carpeta `results/` con los resultados de evaluación del autor, pero no se han proporcionado los valores numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, inferior a 1 GB en la configuración estándar; el modelo es del orden de miles de parámetros.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 2060, RTX 4090) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch nativo, Braindecode, exportación a ONNX no documentada; no aplican vLLM, llama.cpp, Ollama ni TGI por no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos en GPU y de decenas de milisegundos en CPU para lotes pequeños.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EEGNetv4 (esta ficha) | no disponible (orden de miles) | no aplica | EEG | MIT | HuggingFace (iishita1/EEGNetv4) |
| EEGNetv4 original (Lawhern et al., 2018) | no disponible | no aplica | EEG | según publicación | Implementación en Braindecode |
| Otras CNN para EEG en MOABB | no disponible | no aplica | EEG | variable | Braindecode / MOABB |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico de EEG y de imaginería motora; no es un modelo de propósito general ni de lenguaje.
- El rendimiento depende fuertemente del montaje de electrodos, la frecuencia de muestreo y el preprocesado; los pesos pueden no transferir bien a configuraciones distintas de las de entrenamiento.
- Riesgo de sobreajuste a los sujetos y protocolos de cada dataset de MOABB.
- No se documentan sesgos demográficos ni clínicos; la composición de las cohortes de entrenamiento no está detallada en la información disponible.
- La licencia MIT permite uso comercial, pero la procedencia de los datos de entrenamiento (MOABB) puede imponer condiciones adicionales que deben verificarse.
- Los pesos se distribuyen en formato pickle, lo que requiere confiar en el origen del archivo al deserializar; conviene auditar el repositorio antes de cargarlos en producción.
- No hay garantías de robustez ante artefactos (parpadeos, movimiento, ruido muscular) sin un pipeline de limpieza adecuado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria documentada.

## Enlaces

- HuggingFace: https://huggingface.co/iishita1/EEGNetv4
- Repositorio original referenciado en la model card: https://huggingface.co/PierreGtch/EEGNetv4
- Documentación de EEGNetv4 en Braindecode: https://braindecode.org/stable/generated/braindecode.models.EEGNetv4.html
- Artículo original de EEGNet (Lawhern et al., 2018): https://doi.org/10.1088/1741-2552/aace8c
- Notebook de casos de uso: https://neurotechlab.socsci.ru.nl/resources/pretrained_imagery_models/
- Póster con detalles de entrenamiento y evaluación: https://neurotechlab.socsci.ru.nl/resources/pretrained_imagery_models/
- Lista de datasets de motor imagery en MOABB: https://neurotechx.github.io/moabb/dataset_summary.html#motor-imagery
- Documentación del paquete Braindecode: https://robintibor.github.io/braindecode/source/braindecode.models.html
