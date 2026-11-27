# Fetty0707/imdb-sentiment-nn-course-10k

## Resumen

El modelo `Fetty0707/imdb-sentiment-nn-course-10k` es un clasificador binario de sentimiento para resenas de peliculas en ingles, publicado por el usuario Fetty0707 en Hugging Face. No es un modelo de lenguaje generativo ni un transformer preentrenado: se trata de un pipeline clasico de procesamiento de lenguaje natural compuesto por una vectorizacion TF-IDF de unigramas y bigramas seguida de una red neuronal de una sola capa oculta implementada en PyTorch. El modelo se ejecuta en CPU y esta disenado como artefacto de un curso de ingenieria de datos, no como un sistema de produccion.

El problema que resuelve es acotado: dada una resena de pelicula en ingles, devuelve una etiqueta de sentimiento positivo o negativo. Su relevancia es fundamentalmente didactica, ya que ilustra el flujo completo de entrenamiento reproducible (datos versionados, particion estratificada, registro de hashes SHA-256 y ejecucion en GitHub Actions) mas que una contribucion al estado del arte. El repositorio pesa 0.0 GB, lo que confirma que los pesos son de dimension reducida y que el vocabulario TF-IDF y la red son ligeros.

No se dispone de informacion sobre arquitectura de transformer, numero de parametros, longitud de contexto ni cuantizaciones, porque el modelo no es de ese tipo. Los unicos datos de rendimiento publicados son los de su conjunto de test retenido (accuracy 0.8988 sobre 1.997 resenas), que deben interpretarse dentro de las limitaciones de un dataset de curso de 10.000 ejemplos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF (unigramas y bigramas) + red neuronal PyTorch de una capa oculta |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de clasificacion, no generativo; la entrada se vectoriza por bolsa de n-gramas) |
| Tipos de cuantizacion | no disponible (no se publican pesos en formatos cuantizados) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repo no contiene pesos en safetensors ni GGUF; el tamano del repo es 0.0 GB) |
| Pipeline | text-classification |
| Entorno de ejecucion | CPU |
| Dataset de entrenamiento | `imdb_balanced_10k.csv` (7.986 resenas de entrenamiento, 1.997 de test, split 80/20 estratificado, semilla 42) |

## Arquitectura y entrenamiento

La arquitectura combina dos etapas. Primero, un vectorizador TF-IDF ajustado exclusivamente sobre el split de entrenamiento, que extrae unigramas y bigramas de palabras del texto en ingles. Segundo, una red neuronal de una sola capa oculta en PyTorch que recibe ese vector disperso y produce una salida de clasificacion binaria (positivo/negativo). No hay atencion, ni embeddings contextuales, ni mecanismos de transformer; el modelo no captura orden de palabras mas alla de la coocurrencia inmediata que representan los bigramas.

El entrenamiento se realizo sobre el fichero `imdb_balanced_10k.csv`, un dataset de curso alojado en Gitee, previa deduplicacion y particion estratificada 80/20 con semilla 42. La ejecucion quedo registrada en un workflow de GitHub Actions enlazado desde la model card. No se documenta el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de regularizacion, ajuste de hiperparametros o calibracion. La model card indica explicitamente que las puntuaciones softmax no estan calibradas, lo que impide interpretarlas como probabilidades fiables. El codigo de inferencia y los detalles de reproducibilidad (hash SHA-256 de la entrada y revision fijada) se encuentran en el repositorio de GitHub del autor.

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) de resenas de peliculas en ingles.
- Extraccion de caracteristicas mediante TF-IDF con unigramas y bigramas, lo que aporta algo de sensibilidad a negaciones locales del tipo "not good".
- Inferencia en CPU sin requisitos de GPU, adecuada para entornos sin acelerador.
- Reproducibilidad verificable: la model card registra hashes y revisiones fijadas de los artefactos.
- No soporta tool calling ni function calling.
- No soporta comportamiento de agente ni razonamiento multi-paso.
- No soporta generacion de texto, codigo, matematicas, vision ni audio.
- Multilingue: no, unicamente ingles.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Clasificacion por lotes de resenas de peliculas en ingles: dado un fichero CSV de resenas, el modelo asigna una etiqueta de sentimiento a cada fila; es adecuado para experimentos docentes y prototipos rapidos en CPU.
- Filtrado previo en un pipeline de moderacion o analisis de opinion: se puede usar como primera etapa barata para separar resenas positivas de negativas antes de aplicar un modelo mas costoso.
- Ejercicio de evaluacion de modelos en cursos: sirve como linea base clasica (TF-IDF + red pequena) contra la que comparar transformers preentrenados en tareas de sentimiento.
- Demostracion de reproducibilidad en MLOps: el registro de hashes y la ejecucion en GitHub Actions permiten ilustrar practicas de versionado de datos y artefactos.
- Analisis exploratorio de opiniones sobre estrenos: para un corpus acotado de criticas en ingles, permite obtener una distribucion aproximada de polaridad.
- Prototipado de interfaces de clasificacion: al ejecutarse en CPU, se puede integrar en un servicio ligero para validar una idea de producto antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de test retenido (1.997 resenas):

| Metrica | Valor |
|---|---:|
| Accuracy | 0.8988 |
| Macro F1 | 0.8988 |
| Macro precision | 0.8989 |
| Macro recall | 0.8988 |

No se han publicado comparaciones con otros modelos en la informacion disponible, ni resultados en benchmarks estandar como MMLU, HumanEval o GSM8K, que no aplican a esta tarea. Las puntuaciones softmax no estan calibradas segun la model card.

## Requisitos de hardware

- VRAM estimada: 0 GB; el modelo esta disenado para ejecutarse en CPU.
- GPU recomendadas: no aplica; no requiere GPU.
- Cabe en cualquier GPU consumer: si, aunque no es necesario usarla.
- Opciones de despliegue: ejecucion directa con PyTorch y el script `predict.py` del repositorio del autor; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Fetty0707/imdb-sentiment-nn-course-10k` | TF-IDF + red de una capa oculta | no disponible | no aplica | Accuracy 0.8988 en test propio | no disponible | Hugging Face, repo de 0.0 GB |
| Clasificador de sentimiento basado en transformers (p. ej. DistilBERT fine-tuned en IMDb) | Transformer encoder | ~66 M | 512 tokens | no disponible en esta ficha | no disponible | no disponible |
| Clasificador lineal tipo regresion logistica sobre TF-IDF | Modelo lineal | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos verificados de benchmarks de los modelos alternativos dentro de la informacion proporcionada; la comparativa se limita a categoria y enfoque.

## Limitaciones y advertencias

- El modelo solo procesa ingles; el rendimiento en otros idiomas no esta garantizado y probablemente sea muy bajo.
- La model card advierte de posibles caidas de accuracy en sarcasmo, opiniones mixtas y textos fuera del dominio de resenas de peliculas.
- Las puntuaciones softmax no estan calibradas: no deben interpretarse como probabilidades fiables ni usarse para umbrales de decision sin recalibracion.
- El dataset de entrenamiento es un CSV de curso de 10.000 ejemplos, no el corpus IMDb completo; el modelo puede no generalizar a distribuciones reales de resenas.
- No hay informacion sobre sesgos demograficos, culturales o de otro tipo; al entrenarse sobre resenas de peliculas, puede heredar sesgos presentes en ese dominio.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si puede producir clasificaciones erroneas con alta confianza aparente por falta de calibracion.
- Licencia no disponible: no se puede confirmar el uso comercial; se recomienda contactar con el autor antes de cualquier despliegue en produccion.
- El repositorio tiene 0 descargas y 0 likes, y un tamano de 0.0 GB; conviene verificar que los artefactos de inferencia estan efectivamente disponibles en el repositorio de GitHub enlazado.
- No es adecuado como sustituto de un modelo de lenguaje para tareas generativas, de razonamiento o de agente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Fetty0707/imdb-sentiment-nn-course-10k
- Codigo fuente e instrucciones de inferencia: https://github.com/YumemoeNova/imdb-sentiment-nn/tree/39af3cd176d77811f09cd6e8ae9b8035b84cff3b
- Ejecucion de entrenamiento en GitHub Actions: https://github.com/YumemoeNova/imdb-sentiment-nn/actions/runs/45924243109
- Dataset de entrenamiento (Gitee): https://gitee.com/lundechen/data_engineering_master_2026_fall/blob/cf10d7b5c0ba417c76723e34de49d3512766748e/session-400/datasets/imdb_balanced_10k.csv
