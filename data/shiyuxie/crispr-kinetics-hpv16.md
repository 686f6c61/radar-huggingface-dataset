# shiyuxie/crispr-kinetics-hpv16

## Resumen

crispr-kinetics-hpv16 es un modelo de aprendizaje profundo publicado en HuggingFace por el usuario shiyuxie, asociado al artículo "Deep Learning of CRISPR Fluorescence Kinetics for Ultrafast, Quantitative Viral Detection". No es un modelo de lenguaje: se trata de un clasificador de cinéticas de fluorescencia que analiza 15 fotogramas de un pozo de reacción RPA-CRISPR/Cas12a y predice la clase de concentración de ADN de VPH16 (NC, 10 aM, 100 aM, 1 fM) junto con un valor de concentración en escala log10.

La arquitectura es un ensemble de dos redes que comparten un backbone convolucional: una rama procesa las características de los fotogramas con una LSTM y la otra con un Transformer de 2 capas. La salida final es la media de ambas ramas, y cada rama se promedia a su vez sobre 4 volteos (test-time augmentation), lo que estabiliza la predicción. El modelo trabaja sobre recortes de 140x140 píxeles en RGB correspondientes a los fotogramas A015 a A029 (150-290 s) de cada pozo.

Su relevancia radica en el enfoque cuantitativo y ultrarrápido del diagnóstico: en lugar de esperar a la lectura de punto final del ensayo, el modelo extrae la información cinética de los primeros 150-290 segundos. Con 93,3% de exactitud en el conjunto de test (168/180 pozos) y un MAE de 0,18 en log10, el modelo es un ejemplo de aplicación de series temporales de imagen a diagnóstico molecular. El repositorio no declara licencia ni idiomas, y el propio autor restringe el uso a investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble de dos redes con backbone CNN compartido: rama CNN+LSTM y rama CNN+Transformer de 2 capas |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; entrada fija de 15 fotogramas) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de visión; no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`) y checkpoint PyTorch (`best_model.pt`) |
| Modalidad | serie temporal de imágenes de fluorescencia (15 fotogramas RGB) |
| Tarea | clasificación multiclase de 4 clases + regresión de log10 de concentración |
| Resolución de entrada | 140x140 px RGB por fotograma; 15 fotogramas (A015-A029, 150-290 s) |
| Clases de salida | NC, 10 aM, 100 aM, 1 fM |
| Preprocesado | sustracción de `baseline_mean.npy` (imagen media de los pozos NC del conjunto de entrenamiento) |
| Tamaño del repositorio | 0,0 GB (según HuggingFace) |
| Librería | PyTorch |
| Autor | shiyuxie |
| Descargas / likes | 0 / 0 |
| Fecha de publicación | 27 de septiembre de 2026 (última actualización ese mismo día) |

## Arquitectura y entrenamiento

El modelo es un ensemble de dos ramas que comparten el mismo backbone convolucional, encargado de extraer características de cada uno de los 15 fotogramas de entrada. La primera rama modela la evolución temporal de esas características con una LSTM; la segunda, con un Transformer de 2 capas. La predicción final es la media de las salidas de ambas ramas, y cada una de ellas se promedia a su vez sobre 4 volteos (flips) del input, una forma de test-time augmentation que reduce la varianza de la predicción. El repositorio incluye `modeling.py` con las definiciones de las redes y `predict.py` con el preprocesado y la inferencia.

Los datos se dividieron por ejecución experimental (no por pozo) con semilla 42: 60 ejecuciones para entrenamiento, 16 para validación y 15 para test, lo que suma 720, 192 y 180 pozos respectivamente. Antes de entrar a la red, a cada fotograma se le resta la imagen media de los pozos NC del conjunto de entrenamiento (`baseline_mean.npy`), un paso de normalización que elimina la componente constante del fondo. El modelo no se ha entrenado con RLHF ni DPO, ya que no es un modelo generativo de lenguaje. No se especifica en la información disponible el número de tokens, la composición exacta del dataset, la función de pérdida ni el esquema de optimización.

## Capacidades

- Clasificación de concentración de VPH16 en cuatro clases discretas: NC (control negativo), 10 aM, 100 aM y 1 fM.
- Regresión de concentración en escala log10, devuelta junto con la clase predicha y las probabilidades por clase.
- Procesamiento de cinéticas de fluorescencia de 15 fotogramas (150-290 s) por pozo, sin necesidad de esperar la lectura de punto final.
- Inferencia por carpeta de imágenes (`predict_folder`) o por lista de 15 rutas de imagen (`predict`).
- Selección de región de interés (ROI) dentro de la placa mediante el parámetro `roi`.
- Interfaz de línea de comandos (`python predict.py --folder ... --roi ...`) además de la API de Python.
- Ensemble interno con dos arquitecturas temporales distintas (LSTM y Transformer), lo que permite comparar sus predicciones por separado.
- No soporta tool calling, agentes, multi-step reasoning, ni capacidades multilingües o multimodales fuera del dominio de imagen.

## Casos de uso

- Triaje ultrarrápido de muestras de VPH16: el modelo puede clasificar un pozo a partir de los fotogramas de 150-290 s, lo que permite descartar negativos y priorizar muestras positivas sin esperar al punto final del ensayo RPA-CRISPR/Cas12a.
- Cuantificación de concentración relativa: además de la clase, devuelve un valor de log10 de concentración con un MAE de 0,18 en test, útil para estimar carga viral comparativa entre muestras dentro del rango de 10 aM a 1 fM.
- Validación interna de ensayos Cas12a: un laboratorio que desarrolle su propio protocolo puede usar el modelo como referencia para comprobar si su cinética de fluorescencia se comporta como la del conjunto de datos original.
- Automatización de lectura de placas: integrado en un pipeline que capture imágenes de un lector de placas, el modelo consume directamente archivos con el patrón de nombre esperado (`A015 - <timestamp>_roi_<n>.bmp`) y emite clase, concentración y probabilidades.
- Cribado a gran escala en investigación: con 180 pozos de test procesados en un único ensemble y una entrada ligera de 15 imágenes de 140x140, el coste computacional por muestra es bajo, lo que encaja en campañas de cribado con muchas placas.
- Control de calidad de experimentos: las probabilidades de salida permiten detectar pozos ambiguos (por ejemplo, los 9 casos de 100 aM clasificados como 1 fM en el test) y marcarlos para revisión manual.
- Estudio metodológico de arquitecturas temporales: las dos ramas publicadas por separado (LSTM, 91,7% en test; Transformer, 88,9%) permiten analizar el compromiso entre modelos recurrentes y de atención en series de imágenes biológicas.
- Punto de partida para transfer learning a otros analitos: el código de modelado y preprocesado es reutilizable para reentrenar sobre otras cinéticas de fluorescencia, aunque el autor advierte que haría falta reentrenamiento para otros instrumentos o protocolos.

## Benchmarks y rendimiento

Resultados publicados en la model card, con división por ejecución experimental y semilla 42 (720 pozos de entrenamiento, 192 de validación, 180 de test):

| Métrica | Conjunto | Valor |
|---|---|---|
| Exactitud | Validación | 96,9% (186/192) |
| Exactitud | Test | 93,3% (168/180) |
| MAE (log10) | Test | 0,18 |
| Exactitud, solo rama LSTM | Test | 91,7% |
| Exactitud, solo rama Transformer | Test | 88,9% |

Matriz de confusión del conjunto de test (filas = clase real, columnas = clase predicha):

| | NC | 10 aM | 100 aM | 1 fM |
|---|---|---|---|---|
| NC | 36 | 0 | 0 | 0 |
| 10 aM | 2 | 33 | 1 | 0 |
| 100 aM | 0 | 0 | 36 | 0 |
| 1 fM | 0 | 0 | 9 | 63 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. Las cifras de MMLU, HumanEval, GSM8K y similares no aplican a este modelo, que no es un modelo de lenguaje.

## Requisitos de hardware

- No se han publicado cifras de VRAM, latencia ni throughput en la información disponible.
- La entrada es de 15 imágenes RGB de 140x140 píxeles y el repositorio ocupa 0,0 GB según HuggingFace, lo que es coherente con un modelo de dos redes convolucionales pequeñas; por ello es razonable esperar que quepa en cualquier GPU de consumo e incluso que pueda ejecutarse en CPU, aunque esta estimación no está confirmada por el autor.
- El autor no indica GPU recomendadas (A100, H100, RTX 4090 u otras) ni requisitos mínimos de memoria.
- Opciones de despliegue: inferencia directa con PyTorch mediante `predict.py` o la clase `Ensemble`; el modelo no publica integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Dependencias declaradas por el autor: `torch`, `numpy`, `pillow`, `safetensors`, `huggingface_hub`.

## Comparativa con modelos similares

No se han proporcionado modelos comparables en la información disponible. No existen alternativas de referencia publicadas junto a esta ficha, ni métricas de terceros con las que contrastar los resultados. La única comparación interna disponible es la de las dos ramas del propio ensemble:

| Modelo | Arquitectura | Exactitud en test | Licencia | Disponibilidad |
|---|---|---|---|---|
| crispr-kinetics-hpv16 (ensemble) | CNN + LSTM y CNN + Transformer, media de ambas | 93,3% (168/180) | no disponible | HuggingFace |
| Rama LSTM | CNN + LSTM | 91,7% | no disponible | HuggingFace (`lstm/`) |
| Rama Transformer | CNN + Transformer de 2 capas | 88,9% | no disponible | HuggingFace (`transformer/`) |

## Limitaciones y advertencias

- Uso exclusivamente de investigación: la model card indica explícitamente "research use only".
- Entrenado con datos de una única configuración de imagen y un único protocolo de ensayo. Los resultados en otros instrumentos o protocolos pueden no mantenerse sin reentrenamiento.
- Las muestras de 10 fM se fusionaron en la clase de 1 fM durante el entrenamiento, por lo que el modelo no distingue concentraciones superiores a 1 fM.
- No se declara licencia en el repositorio ni en la model card, lo que deja sin definir las condiciones de uso comercial y de redistribución.
- El artículo asociado aún no está publicado: la model card indica que los detalles de cita se añadirán cuando se publique, por lo que no hay revisión por pares disponible.
- Riesgo de error en la frontera entre 100 aM y 1 fM: en el test, 9 de 72 pozos de 100 aM se clasificaron como 1 fM, el principal modo de fallo del modelo.
- También se observan 2 falsos negativos entre los 36 pozos de 10 aM, clasificados como NC, lo que en un escenario clínico implicaría muestras positivas de baja concentración no detectadas.
- Los conjuntos de evaluación son pequeños (192 pozos de validación y 180 de test), procedentes de un único estudio, lo que limita la generalización estadística de las métricas.
- Sin descargas ni likes y con el repositorio publicado y actualizado el mismo día, no existe validación independiente por parte de la comunidad.
- No hay información sobre sesgos demográficos, ya que el modelo opera sobre señales de fluorescencia y no sobre datos de pacientes.
- No se documentan los límites de detección fuera del rango de 10 aM a 1 fM, ni el comportamiento con pozos sin amplificación o con inhibición de la reacción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shiyuxie/crispr-kinetics-hpv16
- Artículo asociado: "Deep Learning of CRISPR Fluorescence Kinetics for Ultrafast, Quantitative Viral Detection" (detalles de cita pendientes de publicación según la model card; no disponible el enlace)
- Repositorio de código: no disponible (el autor distribuye `modeling.py` y `predict.py` dentro del propio repositorio de HuggingFace)
- Demo: no disponible
