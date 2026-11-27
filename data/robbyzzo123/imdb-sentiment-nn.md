# robbyzzo123/imdb-sentiment-nn

## Resumen

`robbyzzo123/imdb-sentiment-nn` es un clasificador binario de sentimiento para resenas de peliculas en ingles. No es un modelo de lenguaje generativo, sino un pipeline clasico de procesamiento de lenguaje natural compuesto por un vectorizador TF-IDF de unigramas y bigramas seguido de un clasificador feedforward implementado en PyTorch. El autor es `robbyzzo123` y el modelo se publico en Hugging Face con el pipeline `text-classification`.

El modelo resuelve una tarea acotada: predecir si una resena cinematografica es positiva o negativa. Se entreno sobre un CSV de IMDb proporcionado en un curso, con una division de validacion para seleccionar la mejor epoca segun la perdida de validacion. Segun la model card, alcanza un 89,48 % de accuracy y un macro F1 de 0,8948 sobre un conjunto de test de 1.997 resenas.

Su relevancia es limitada en el contexto actual de modelos fundacionales: se trata de un artefacto academico pequeno, sin licencia declarada, con cero descargas y cero likes en el momento de la consulta. Resulta util como referencia didactica de un pipeline TF-IDF + red neuronal y para tareas muy concretas de analisis de sentimiento en resenas de cine en ingles, pero no compite con modelos transformer preentrenados en capacidad, robustez ni generalizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF (unigramas y bigramas) + clasificador feedforward en PyTorch |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende de la configuracion del vectorizador) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (PyTorch) y `vectorizer.pkl` (vectorizador serializado) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline en dos etapas. Primero, un vectorizador TF-IDF configurado con unigramas y bigramas transforma el texto de entrada en un vector disperso de caracteristicas. Despues, un clasificador feedforward de PyTorch procesa ese vector y produce una distribucion de probabilidad sobre dos clases (negativo y positivo). No se trata de un transformer ni de un modelo con mecanismos de atencion; es una red densa sobre representaciones bag-of-ngrams.

El entrenamiento se realizo sobre el CSV `imdb_balanced_10k.csv` proporcionado en un curso, con un conjunto de test retenido de 1.997 resenas. El vocabulario TF-IDF se ajusto exclusivamente sobre los datos de entrenamiento, y la mejor epoca se selecciono por perdida de validacion. El autor indica que el entrenamiento y la publicacion de los artefactos se ejecutaron mediante GitHub Actions a partir del commit `19db5b7` del repositorio `robbyzo/imdb-sentiment-nn`. No se documentan tecnicas de RLHF, DPO, decodificacion especulativa ni innovaciones de atencion.

## Capacidades

- Clasificacion binaria de sentimiento (positivo o negativo) en resenas de peliculas en ingles.
- Procesamiento de texto de dominio cinematografico, con vocabulario ajustado sobre resenas de IMDb.
- Salida de probabilidad softmax por clase, aunque el autor advierte que no esta calibrada.
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingue nula: solo contempla ingles.
- No incluye modo thinking, vision ni audio.

## Casos de uso

- Analisis de sentimiento en resenas de cine: el modelo clasifica resenas de IMDb en positivas o negativas, aprovechando que su vocabulario TF-IDF se ajusto sobre ese mismo dominio. Es adecuado para prototipos y experimentos docentes.
- Etiquetado masivo de resenas historicas: al ser un pipeline ligero de TF-IDF + red densa, puede procesar lotes grandes de resenas en CPU sin necesidad de GPU, lo que facilita el etiquetado inicial de corpus.
- Filtrado de opiniones en foros de cine: se puede usar como primera capa para separar comentarios positivos y negativos antes de un analisis mas profundo.
- Monitorizacion de recepcion de estrenos: dado un flujo de resenas de una pelicula, el modelo permite calcular la proporcion de opiniones positivas y negativas de forma rapida.
- Docencia y demostracion de pipelines NLP: sirve como ejemplo completo de vectorizacion TF-IDF, entrenamiento en PyTorch, seleccion de epoca por validacion y publicacion automatizada con GitHub Actions.
- Baseline en experimentos de clasificacion: puede actuar como referencia de comparacion frente a modelos transformer preentrenados en tareas de analisis de sentimiento.
- Preetiquetado para anotacion humana: las predicciones del modelo pueden priorizar que resenas revisar manualmente en un proceso de anotacion supervisada.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Resenas de test | 1.997 |
| Accuracy | 89,48 % |
| Macro F1 | 0,8948 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor remite a `metrics.json` para las puntuaciones por clase y la matriz de confusion, pero esos datos no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo TF-IDF + red densa de pequeno tamano, es probable que funcione en CPU, pero no se documenta el numero de parametros ni el consumo exacto.
- GPU recomendadas: no disponible; no se requiere GPU para un pipeline de esta naturaleza, aunque no se confirma en la model card.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano reducido del repositorio (0,0 GB), pero no se aportan datos oficiales.
- Opciones de despliegue: el autor documenta inferencia mediante `hf download` y el script `predict.py` del repositorio de GitHub. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `robbyzzo123/imdb-sentiment-nn` | no disponible | no disponible | 89,48 % accuracy en IMDb | no disponible | Hugging Face, 0 descargas |
| Modelos transformer de analisis de sentimiento (p. ej., DistilBERT fine-tuned en SST-2/IMDb) | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha |

No se dispone de datos verificados de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Dominio restringido: el modelo esta pensado para resenas de peliculas en ingles; su rendimiento fuera de ese dominio no esta garantizado.
- Dificultad con sarcasmo y sentimiento mixto: el autor advierte explicitamente que el modelo es menos adecuado para estos casos.
- Probabilidad no calibrada: la puntuacion softmax no debe interpretarse como una probabilidad calibrada; no es fiable para umbrales estrictos sin postprocesado.
- Solo ingles: no soporta otros idiomas.
- Licencia no declarada: no se especifican condiciones de uso comercial, lo que supone un riesgo legal para produccion.
- Sin datos de sesgos: no se documentan evaluaciones de sesgo ni de robustez.
- Riesgo de sobreajuste al vocabulario del corpus de entrenamiento: al usar TF-IDF ajustado sobre el conjunto de entrenamiento, la generalizacion a otros estilos o generos puede degradarse.
- Sin soporte de contexto largo ni de entradas conversacionales: no es un modelo generativo ni apto para tareas de razonamiento.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, sin senales de mantenimiento o validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/robbyzzo123/imdb-sentiment-nn
- Repositorio del proyecto: https://github.com/robbyzo/imdb-sentiment-nn
- Commit de entrenamiento y publicacion: https://github.com/robbyzo/imdb-sentiment-nn/commit/19db5b7cb50b76f04e752ab56cef9e97479c8a16
- Dataset de entrenamiento (CSV): https://gitee.com/lundechen/data_engineering_master_2026_fall/blob/cf10d7b5c0ba417c76723e34de49d3512766748e/session-400/datasets/imdb_balanced_10k.csv
