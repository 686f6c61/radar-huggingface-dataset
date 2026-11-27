# Fetty0707/imdb-sentiment-nn

## Resumen

IMDb Sentiment Neural Network es un clasificador binario de sentimiento para resenas de peliculas en ingles, publicado por el usuario Fetty0707 en Hugging Face. No se trata de un modelo de lenguaje generativo, sino de un pipeline clasico de procesamiento de lenguaje natural que combina una representacion TF-IDF de unigramas y bigramas con una red neuronal PyTorch de una sola capa oculta. Su objetivo es determinar si una resena de estilo IMDb es positiva o negativa, una tarea de referencia habitual en la literatura de analisis de sentimiento.

El modelo esta disenado para ejecutarse en CPU, lo que lo hace muy ligero y adecuado para entornos con recursos limitados o para servir como linea base en experimentos de clasificacion de texto. Segun la model card, se entreno con 7.991 resenas y se evaluo sobre un conjunto de test de 1.995 resenas, alcanzando una exactitud de 0,8717 y un F1 macro identico, lo que sugiere un conjunto de evaluacion equilibrado entre clases.

Su relevancia es limitada en el panorama actual de modelos generativos de gran escala, pero resulta util como referencia reproducible: el autor documenta el codigo fuente, la ejecucion de entrenamiento en GitHub Actions y el dataset de origen (Stanford IMDb). Es, por tanto, un ejemplo de pipeline completo y trazable mas que un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feedforward (perceptron multicapa) de una capa oculta sobre caracteristicas TF-IDF de unigramas y bigramas |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende de la vectorizacion TF-IDF; no es un modelo de contexto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | no disponible (pesos PyTorch; el repositorio ocupa 0.0 GB) |

## Arquitectura y entrenamiento

La arquitectura combina un vectorizador TF-IDF ajustado sobre el split de entrenamiento, que extrae unigramas y bigramas, con una red neuronal PyTorch de una capa oculta. La salida es una distribucion softmax de dos clases (positiva y negativa). No se especifica en la informacion disponible el numero de unidades de la capa oculta, la funcion de activacion, la dimension del vocabulario resultante ni los hiperparametros de entrenamiento (tasa de aprendizaje, numero de epocas, tamano de lote).

El entrenamiento utilizo 7.991 resenas y la evaluacion se realizo sobre 1.995 resenas del conjunto de test de Stanford IMDb. La model card indica que el CSV de entrenamiento y su hash SHA-256 estan identificados en `config.json`, y enlaza el codigo fuente y una ejecucion de entrenamiento en GitHub Actions, lo que aporta trazabilidad al proceso. No se documenta el uso de RLHF, DPO ni tecnicas de ajuste fino adicionales, algo esperable en un modelo de esta categoria.

## Capacidades

- Clasificacion binaria de sentimiento (positivo o negativo) de resenas de peliculas en ingles.
- Procesamiento de texto basado en TF-IDF con unigramas y bigramas, sin comprension semantica profunda.
- Inferencia en CPU, sin necesidad de GPU.
- No dispone de soporte de tool calling ni de function calling.
- No esta orientado a agentes ni a razonamiento multi-paso.
- Capacidad multilingue nula: solo ingles.
- No dispone de modo thinking, vision ni audio.
- No es un modelo generativo: no produce texto libre, solo etiquetas de clasificacion.

## Casos de uso

- Clasificacion por lotes de resenas de peliculas: el modelo puede procesar grandes volumenes de resenas en ingles en CPU para etiquetarlas como positivas o negativas, con un coste computacional minimo.
- Linea base en experimentos de analisis de sentimiento: sirve como referencia reproducible (con codigo, dataset y ejecucion de entrenamiento documentados) frente a la que comparar modelos mas complejos como transformers ajustados.
- Filtrado previo en pipelines de moderacion o analisis de opinion: puede actuar como primer filtro rapido para separar resenas claramente positivas o negativas antes de aplicar modelos mas costosos.
- Educacion y demostraciones: su simplicidad y su ejecucion en CPU lo hacen adecuado para talleres o cursos sobre pipelines clasicos de NLP con scikit-learn y PyTorch.
- Analisis de opinion en dominios acotados: puede emplearse en prototipos de analisis de resenas de productos o contenidos audiovisuales, siempre que el texto se parezca al dominio de resenas de peliculas.
- Servicio ligero de clasificacion en entornos con recursos limitados: al ejecutarse en CPU, puede desplegarse en contenedores pequenos o dispositivos sin GPU para tareas de etiquetado de bajo volumen.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| Accuracy | 0,8717 |
| F1 macro | 0,8717 |
| Precision macro | 0,8717 |
| Recall macro | 0,8717 |

Resultados sobre un conjunto de test de 1.995 resenas, con entrenamiento sobre 7.991 resenas. Las puntuaciones son salidas softmax sin calibrar. No se han publicado en la informacion disponible comparaciones con otros modelos ni resultados en otros benchmarks como MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo esta disenado para ejecutarse en CPU.
- GPU recomendadas: no requiere GPU; puede ejecutarse en cualquier CPU convencional.
- Compatibilidad con GPU de consumo: no aplica, al estar pensado para CPU.
- Opciones de despliegue: el autor indica que se use `predict.py` del repositorio de GitHub enlazado; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| Fetty0707/imdb-sentiment-nn | TF-IDF + MLP | no disponible | no aplica | Accuracy 0,8717 en test propio | no disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos sobre modelos comparables (por ejemplo, clasificadores de sentimiento basados en transformers como DistilBERT ajustado en IMDb) que permitan una comparacion rigurosa de parametros, contexto y rendimiento.

## Limitaciones y advertencias

- Riesgo de alucinacion: no aplica en sentido generativo, pero el modelo puede producir clasificaciones erroneas con alta confianza, ya que las salidas softmax no estan calibradas.
- Sesgos conocidos: no se documentan en la informacion disponible; al entrenarse solo con resenas de peliculas en ingles, el dominio y el idioma estan fuertemente restringidos.
- Limitaciones de idioma: solo admite ingles; el rendimiento en otros idiomas no esta garantizado y probablemente sea deficiente.
- Limitaciones de dominio: la model card advierte de que la exactitud puede ser menor ante sarcasmo, opiniones mixtas y texto fuera del dominio de resenas de peliculas.
- Restricciones de licencia: la licencia no esta disponible, por lo que no puede confirmarse el uso comercial; conviene contactar con el autor antes de utilizarlo en produccion.
- Caveat para produccion: el modelo se entreno con 7.991 resenas y se evaluo con 1.995, un volumen reducido; ademas, el repositorio ocupa 0.0 GB y no se detalla el formato exacto de los pesos, lo que exige revisar el codigo fuente para su integracion.
- Fecha de creacion y actualizacion: el modelo figura como creado y actualizado en noviembre de 2026, dato que conviene verificar en la plataforma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Fetty0707/imdb-sentiment-nn
- Codigo fuente e instrucciones de inferencia: https://github.com/YumemoeNova/imdb-sentiment-nn/tree/7d6f34d59adb847157286f4eb33c06efe04bd180
- Ejecucion de entrenamiento en GitHub Actions: https://github.com/YumemoeNova/imdb-sentiment-nn/actions/runs/45919339606
- Dataset Stanford IMDb: https://huggingface.co/datasets/stanfordnlp/imdb
