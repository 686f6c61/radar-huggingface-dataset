# callmezoey/agnews-distilbert

## Resumen

`callmezoey/agnews-distilbert` es un clasificador de temas de noticias en ingles construido mediante fine-tuning de `distilbert-base-uncased` sobre el dataset AG News de Hugging Face (`fancyzhx/ag_news`). El modelo resuelve una tarea de clasificacion de texto en cuatro clases: World, Sports, Business y Sci/Tech. Lo desarrolla el usuario `callmezoey` y se publica como un artefacto de proposito especifico, no como un modelo de uso general.

Arquitectonicamente es un transformer encoder de tipo DistilBERT (destilacion de BERT-base, aproximadamente 66 millones de parametros) con una cabeza de clasificacion compuesta por dropout seguido de una capa lineal aplicada sobre el vector `[CLS]`. El entrenamiento se realizo con un bucle de PyTorch escrito manualmente, sin el `Trainer` de la libreria Transformers, segun indica la model card.

Su relevancia es acotada: no compite en capacidades generativas ni de razonamiento, sino que sirve como componente ligero de enrutamiento o etiquetado tematico dentro de pipelines de noticias. El autor lo emplea para generar un resumen diario de noticias RSS. La model card reporta una precision de test del 94,74 %, superior al baseline TF-IDF + regresion logistica (91,72 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilacion de BERT-base) con cabeza dropout + lineal sobre `[CLS]` |
| Parametros totales | no disponible (el modelo base DistilBERT tiene aproximadamente 66 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base admite hasta 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `state_dict` (`model.pt`); no se indica safetensors ni GGUF |
| Tamano del repositorio | 0,3 GB |
| Tarea (pipeline) | text-classification |
| Numero de clases | 4 (World, Sports, Business, Sci/Tech) |
| Modelo base | distilbert-base-uncased |
| Dataset de entrenamiento | fancyzhx/ag_news |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, un transformer encoder de 6 capas obtenido por destilacion de BERT-base, y le anade una cabeza de clasificacion formada por dropout y una capa lineal que opera sobre la representacion `[CLS]` de la ultima capa. La salida es una distribucion sobre las cuatro categorias de AG News. No se trata de un modelo generativo ni emplea atencion lineal, SSM ni arquitecturas hibridas.

El entrenamiento se llevo a cabo con un bucle de PyTorch escrito a mano, segun la model card, sobre el dataset AG News. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, la presencia de RLHF/DPO (no aplicable en una tarea de clasificacion supervisada) ni los hiperparametros de optimizacion. La model card unicamente documenta el umbral de confianza elegido sobre el conjunto de validacion (0,9), que cubre el 91,2 % de los articulos con una precision del 97,3 %. El artefacto publicado es un `state_dict` de PyTorch pensado para cargarse con la clase `TextClassifier` del repositorio del autor.

## Capacidades

- Clasificacion de texto en cuatro categorias tematicas: World, Sports, Business y Sci/Tech.
- Salida de probabilidades por clase, lo que permite aplicar umbrales de confianza y derivar articulos a revision humana cuando la certeza es baja.
- Procesamiento de articulos de noticias en ingles, con la tokenizacion WordPiece de `distilbert-base-uncased`.
- Inferencia ligera y de baja latencia, adecuada para clasificar lotes grandes de titulares o resumenes RSS.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No soporta tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni para uso como agente.
- Capacidad multilingue: limitada al ingles; no se documenta soporte para otros idiomas.

## Casos de uso

- Enrutamiento tematico de feeds RSS: el modelo clasifica cada articulo entrante en una de las cuatro categorias y permite generar boletines segmentados por seccion, que es exactamente el uso que el autor documenta en su repositorio.
- Moderacion y organizacion de un agregador de noticias: asignar automaticamente una etiqueta tematica a miles de titulares diarios para construir indices o vistas filtradas por tema.
- Filtrado previo en pipelines de analisis: descartar o derivar articulos de Sci/Tech o Business antes de pasarlos a modelos mas costosos de resumen o extraccion de entidades.
- Etiquetado asistido para anotacion humana: usar la probabilidad de salida y el umbral de 0,9 para preanotar un corpus y reducir el trabajo manual de revision.
- Analisis de tendencias por categoria: agregar conteos de articulos por tema a lo largo del tiempo para detectar cambios en la cobertura mediatica.
- Clasificacion en entornos con recursos limitados: al ser un DistilBERT, puede ejecutarse en CPU o en GPUs de gama baja para tareas de alto volumen donde no se justifica un modelo mayor.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Mejor precision de validacion | 94,66 % |
| Precision de test | 94,74 % |
| Baseline TF-IDF + regresion logistica (test) | 91,72 % |
| Cobertura con confianza >= 0,9 | 91,2 % de los articulos |
| Precision en el subconjunto de confianza >= 0,9 | 97,3 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, dado que la tarea del modelo es de clasificacion y no de generacion o razonamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 para un modelo de aproximadamente 66 millones de parametros; el repositorio ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; una NVIDIA T4, RTX 3060 o superior es mas que suficiente.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en CPU para lotes moderados.
- Opciones de despliegue: al publicarse como `state_dict` de PyTorch, requiere cargarse mediante la clase `TextClassifier` del repositorio del autor o reconstruir la cabeza de clasificacion. No se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision en AG News | Licencia | Formato |
|---|---|---|---|---|---|
| callmezoey/agnews-distilbert | no disponible (base DistilBERT, ~66 M) | no disponible (base 512) | 94,74 % (test) | no disponible | PyTorch `state_dict` |
| Koushim/distilbert-agnews | no disponible (base DistilBERT) | no disponible (base 512) | no disponible | apache-2.0 | Safetensors, PyTorch |
| distilbert-base-uncased (sin fine-tuning) | ~66 M | 512 | no disponible | apache-2.0 | Safetensors, PyTorch |

La comparativa se limita a variantes de DistilBERT fine-tuneadas sobre AG News, ya que no se dispone de datos de rendimiento de alternativas de mayor tamano en la informacion proporcionada. La diferencia principal frente a `Koushim/distilbert-agnews` es la licencia declarada (apache-2.0 en el caso de Koushim, no disponible en este modelo) y el formato de pesos (safetensors frente a `state_dict` de PyTorch).

## Limitaciones y advertencias

- La licencia no esta declarada en la informacion disponible; antes de un uso comercial es necesario verificar los terminos en la pagina del modelo y, en su defecto, los del modelo base `distilbert-base-uncased`.
- El modelo solo clasifica en ingles; textos en otros idiomas produciran predicciones poco fiables.
- Esta restringido a cuatro categorias fijas de AG News; no generaliza a taxonomias arbitrarias sin reentrenamiento.
- Riesgo de sesgo heredado del corpus AG News, que proviene de titulares y descripciones de agencias de noticias y puede sobrerrepresentar ciertos temas o estilos editoriales.
- Riesgo de error en articulos ambiguos o de tematica mixta; la model card recomienda usar el umbral de confianza de 0,9 para derivar casos dudosos.
- El formato de pesos es un `state_dict` de PyTorch vinculado a una clase concreta (`TextClassifier`), lo que anade friccion de integracion frente a un modelo cargable directamente con `AutoModelForSequenceClassification`.
- No se documentan metricas de calibracion, robustez ante dominios distintos de AG News ni evaluacion de sesgos.
- Al ser un artefacto con 0 descargas y 0 likes, carece de validacion externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/callmezoey/agnews-distilbert
- Repositorio del autor con la clase `TextClassifier`: https://github.com/Mengyi-An/text-classifier
- Dataset AG News: https://huggingface.co/datasets/fancyzhx/ag_news
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Alternativa comparable: https://huggingface.co/Koushim/distilbert-agnews
