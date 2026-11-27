# jiahao-zhang/imdb-sentiment-nn

## Resumen

El modelo `jiahao-zhang/imdb-sentiment-nn` es un clasificador binario de sentimiento para resenas de peliculas del corpus IMDB. No se trata de un modelo de lenguaje generativo, sino de una red neuronal feedforward (MLP) que opera sobre representaciones TF-IDF de n-gramas. El autor lo publica bajo el identificador `jiahao-zhang` y lo entrena de forma automatizada mediante un pipeline de CI/CD con GitHub Actions, sin intervencion manual en la subida al Hub.

La arquitectura es deliberadamente ligera: una capa oculta de 32 unidades con activacion ReLU y dropout, alimentada por un vectorizador TF-IDF con un vocabulario de 5000 terminos. El modelo resuelve una tarea acotada de clasificacion de texto y reporta metricas sobre un conjunto de test de 2000 muestras: accuracy de 0.874, F1 de 0.876 y ROC-AUC de 0.9478.

Su relevancia es limitada en el panorama actual de IA open source, dominado por transformers y modelos generativos. Resulta util como referencia docente, como baseline reproducible en experimentos de analisis de sentimiento o como ejemplo de despliegue automatizado de artefactos de machine learning. No obstante, su tamano de repositorio es de 0.0 GB, no declara licencia ni idiomas, y no cuenta con descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP feedforward (TF-IDF + una capa oculta de 32 unidades, ReLU + dropout) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificacion por vector TF-IDF, no modelo autoregresivo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el corpus IMDB es en ingles, pero no se declara formalmente) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (state dict de PyTorch), `vectorizer.pkl` (TF-IDF serializado), `config.json`, `metrics.json` |

## Arquitectura y entrenamiento

La arquitectura consiste en un perceptron multicapa con una unica capa oculta de 32 neuronas, activacion ReLU y dropout. La entrada no son tokens ni embeddings contextuales, sino un vector TF-IDF de n-gramas construido con un vocabulario de 5000 terminos. La salida es una clasificacion binaria: negativa (0) o positiva (1). Se trata, por tanto, de un pipeline clasico de procesamiento de lenguaje natural previo a la era de los transformers.

El entrenamiento se realiza y publica de forma automatica mediante GitHub Actions CI/CD, segun indica la model card. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset mas alla de IMDB, ni si se aplicaron tecnicas de regularizacion adicionales, aumentacion de datos o ajuste de hiperparametros. Tampoco se documenta el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un clasificador de este tipo. La innovacion tecnica destacable es la reproducibilidad del pipeline de publicacion, no la arquitectura en si.

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) sobre texto en formato de resena.
- Extraccion de caracteristicas mediante TF-IDF con n-gramas y vocabulario de 5000 terminos.
- Inferencia rapida y de bajo coste computacional al no requerir GPU para el modelo en si.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues declaradas.
- No dispone de modo thinking, vision ni audio.
- No es un modelo generativo: no produce texto libre, solo una etiqueta y, presumiblemente, una probabilidad asociada.

## Casos de uso

- Baseline en experimentos de analisis de sentimiento: sirve como referencia minima contra la que comparar modelos transformer o LLM en tareas de clasificacion de resenas, gracias a sus metricas documentadas (accuracy 0.874, F1 0.876, ROC-AUC 0.9478).
- Docencia y formacion: ejemplo completo de pipeline TF-IDF + MLP con artefactos versionados (`model.pt`, `vectorizer.pkl`, `config.json`, `metrics.json`) para explicar el ciclo de vida de un modelo clasico.
- Clasificacion rapida de resenas en entornos con CPU: al no requerir GPU, puede desplegarse en servicios ligeros para etiquetar grandes volumenes de texto con baja latencia.
- Filtrado previo en pipelines de moderacion: uso como primera etapa para descartar resenas claramente positivas o negativas antes de pasar a un modelo mas costoso.
- Pruebas de integracion CI/CD de modelos: el flujo de GitHub Actions documentado permite validar procesos de publicacion automatizada de artefactos en el Hub.
- Prototipado de APIs de inferencia: por su reducido tamano, es adecuado para levantar endpoints de prueba con FastAPI o Flask sin infraestructura especializada.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Accuracy | 0.874 |
| F1 | 0.876 |
| ROC-AUC | 0.9478 |
| Muestras de test | 2000 |
| Tamano de vocabulario | 5000 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo es una MLP de una capa oculta de 32 unidades sobre vectores TF-IDF de 5000 dimensiones, por lo que puede ejecutarse en CPU.
- GPU recomendadas: no requiere GPU. Cualquier CPU moderna es suficiente.
- Cabe en cualquier GPU consumer, aunque no es necesario usarla.
- Opciones de despliegue: PyTorch nativo (carga de `model.pt` y `vectorizer.pkl`), exportacion a ONNX, o servicio ligero con FastAPI/Flask. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jiahao-zhang/imdb-sentiment-nn` | TF-IDF + MLP | no disponible | no aplica | no disponible | Hugging Face |
| Clasificadores lineales TF-IDF (p. ej. regresion logistica) | TF-IDF + modelo lineal | no disponible | no aplica | variable | Amplia |
| DistilBERT fine-tuned en IMDB | Transformer encoder | ~66 M | 512 tokens | Apache 2.0 (tipicamente) | Hugging Face |
| RoBERTa fine-tuned en IMDB | Transformer encoder | ~125 M | 512 tokens | MIT (tipicamente) | Hugging Face |

La comparativa se basa en categorias generales de modelos de clasificacion de sentimiento; no se dispone de resultados de benchmarks cruzados en la informacion proporcionada. Los modelos transformer citados suelen superar en accuracy a las aproximaciones TF-IDF + MLP, a costa de mayor coste computacional y tamano.

## Limitaciones y advertencias

- No se declara licencia, por lo que el uso comercial queda sin autorizacion explicita y debe consultarse con el autor.
- No se declaran idiomas soportados; el entrenamiento sobre IMDB sugiere ingles, pero no esta formalizado.
- Al ser un clasificador entrenado sobre resenas de peliculas, el dominio de aplicacion es estrecho y el rendimiento puede degradarse fuera de ese contexto.
- Riesgo de sesgo heredado del corpus IMDB (opiniones de usuarios de una plataforma concreta, posibles desequilibrios demograficos y culturales).
- No es un modelo generativo: no puede emplearse para resumen, traduccion, codigo ni dialogos.
- No se documentan tecnicas de calibracion de probabilidades ni umbrales recomendados.
- El vocabulario fijo de 5000 terminos limita la cobertura lexica y puede penalizar textos con vocabulario fuera de dominio.
- El modelo se publica mediante CI/CD automatico; conviene verificar la integridad de los artefactos antes de usarlos en produccion.
- No se dispone de informacion sobre el proceso de entrenamiento (epocas, optimizador, tasa de aprendizaje), lo que dificulta su reproduccion exacta.

## Enlaces

- Hugging Face: https://huggingface.co/jiahao-zhang/imdb-sentiment-nn
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
