# PouyaZX4/persian-5gram-kenlm

## Resumen

El modelo `PouyaZX4/persian-5gram-kenlm` es un modelo de lenguaje estadístico basado en n-gramas de orden 5, entrenado con la herramienta KenLM para el idioma persa. A diferencia de los modelos neuronales modernos, este tipo de modelo calcula la probabilidad de una secuencia de palabras a partir de frecuencias observadas en un corpus de texto, aplicando técnicas de suavizado como Kneser-Ney. Fue desarrollado por el usuario PouyaZX4 y publicado bajo licencia Apache 2.0.

Su relevancia radica en ser una opción ligera y eficiente para tareas de procesamiento del lenguaje natural en persa donde se requiere una estimación rápida de probabilidad de secuencias, como en sistemas de reconocimiento de voz, corrección ortográfica o como línea base para comparar modelos neuronales. Sin embargo, la información pública disponible es muy limitada: no se especifican detalles del corpus de entrenamiento, tamaño del vocabulario ni métricas de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | n-grama de orden 5 (5-gram) con KenLM |
| Parametros totales | no disponible (modelo estadistico, no neuronal) |
| Parametros activos | no aplica |
| Longitud de contexto | 5 palabras (ventana fija) |
| Tipos de cuantizacion | no aplica (modelo basado en recuentos) |
| Idiomas soportados | persa (inferido del nombre del modelo) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (probablemente formato binario o ARPA de KenLM) |

## Arquitectura y entrenamiento

KenLM es una biblioteca para construir y consultar modelos de lenguaje n-grama de forma eficiente. El modelo se entrena contando las frecuencias de secuencias de hasta 5 palabras en un corpus de texto en persa y aplicando suavizado (típicamente Kneser-Ney modificado) para asignar probabilidades a secuencias no vistas. No se dispone de información sobre el tamaño del corpus, el preprocesamiento aplicado ni el vocabulario resultante. Al ser un modelo estadístico clásico, no utiliza redes neuronales ni técnicas de RLHF/DPO.

## Capacidades

- Estimacion de probabilidad de secuencias de palabras en persa.
- Calculo de perplejidad de textos.
- Generacion de texto basada en n-gramas (limitada a 5 palabras de contexto).
- Util como modelo de lenguaje en decodificacion de reconocimiento de voz (ASR).
- Soporte para correccion ortografica basada en probabilidad de secuencias.
- No incluye capacidades de razonamiento, generacion de codigo, tool calling ni multimodalidad.

## Casos de uso

- Correccion ortografica en persa: el modelo puede puntuar candidatos de correccion segun su probabilidad en el contexto de 5 palabras, ayudando a elegir la opcion mas natural.
- Reconocimiento de voz: integrable como modelo de lenguaje en el decodificador de un sistema ASR para rerankear hipotesis y mejorar la precision.
- Autocompletado basico de texto: sugiere la siguiente palabra mas probable en funcion de las ultimas 4, util en teclados o editores simples.
- Evaluacion de fluidez textual: calcula la perplejidad de un texto persa para medir su naturalidad, util en control de calidad de traducciones.
- Filtrado de texto: detecta secuencias poco probables que podrian indicar ruido o errores en datos de entrada.
- Linea base para comparacion: sirve como referencia estadistica para evaluar la mejora de modelos neuronales en tareas de lenguaje persa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Ejecucion en CPU: el modelo es extremadamente ligero, requiere menos de 100 MB de RAM en memoria (dependiendo del vocabulario).
- No requiere GPU: la inferencia se realiza en milisegundos incluso en procesadores modestos.
- Despliegue: se puede usar directamente con la biblioteca KenLM (https://kheafield.com/code/kenlm/) o mediante wrappers en Python como `kenlm` (pip install kenlm).
- No es compatible con vLLM, Ollama o TGI, ya que no es un modelo neuronal.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (n-gramas persas). Existen modelos neuronales persas como `HooshvareLab/bert-fa-base-uncased` o `persian-llm`, pero no son directamente comparables por su naturaleza y tamano. La informacion disponible no permite una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo estadistico: no captura relaciones semanticas profundas ni contexto mas alla de 5 palabras.
- Dependencia del corpus: la calidad depende del corpus de entrenamiento, que no se ha documentado; puede contener sesgos o vocabulario limitado.
- Riesgo de alucinacion: al ser probabilistico, puede generar secuencias gramaticalmente posibles pero sin sentido.
- Sin soporte para otros idiomas: el modelo esta disenado exclusivamente para persa.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia del corpus de entrenamiento para evitar problemas de derechos de autor.
- No apto para tareas complejas de razonamiento, generacion creativa o codigo.

## Enlaces

- HuggingFace: https://huggingface.co/PouyaZX4/persian-5gram-kenlm
- KenLM (herramienta de entrenamiento e inferencia): https://kheafield.com/code/kenlm/
