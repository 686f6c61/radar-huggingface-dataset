# niu-pio/imdb-sentiment-nn

## Resumen

`niu-pio/imdb-sentiment-nn` es un clasificador binario de sentimiento para resenas de IMDb en ingles. Se trata de un proyecto de curso publicado automaticamente mediante GitHub Actions, no de un modelo de lenguaje generativo. La arquitectura es un perceptron multicapa (MLP) implementado en PyTorch con una unica capa oculta de 64 unidades, alimentado por representaciones TF-IDF de unigramas y bigramas calculadas con scikit-learn.

El modelo resuelve una tarea acotada: determinar si una resena de cine en ingles es positiva o negativa. No genera texto, no razona y no soporta tool calling ni dialogos multi-turno. Su interes es fundamentalmente didactico y como referencia de un pipeline clasico de procesamiento de lenguaje natural (TF-IDF + red neuronal ligera) frente a los transformers modernos.

El repositorio tiene un tamano declarado de 0,0 GB, cero descargas y cero likes en el momento de la consulta, y se creo y actualizo el 2026-11-27. La model card reporta una precision de 0,8600 y un F1 macro de 0,8586 sobre un conjunto de prueba de solo 100 ejemplos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptron multicapa) en PyTorch con una capa oculta de 64 unidades sobre caracteristicas TF-IDF |
| Parametros totales | no disponible (depende del tamano del vocabulario TF-IDF; no se publica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto; la entrada es un vector TF-IDF de unigramas y bigramas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | pickle de PyTorch (segun las instrucciones de carga de la model card) |

## Arquitectura y entrenamiento

El modelo es un clasificador de texto clasico en dos etapas. Primero, un vectorizador TF-IDF de scikit-learn convierte cada resena en un vector disperso de unigramas y bigramas; el vectorizador se ajusta unicamente sobre las resenas de entrenamiento, lo que evita fuga de informacion. Despues, un MLP de PyTorch con una capa oculta de 64 unidades recibe ese vector y produce una clasificacion binaria de sentimiento.

La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset (mas alla de que son resenas de IMDb en ingles), ni si se aplicaron tecnicas de regularizacion, dropout, RLHF o DPO. El split es estratificado y el entrenamiento y la publicacion se automatizan mediante GitHub Actions. No se documenta ninguna innovacion tecnica destacable (atencion lineal, decodificacion especulativa, etc.); es un pipeline convencional de NLP.

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) de resenas de IMDb en ingles.
- Extraccion de caracteristicas mediante TF-IDF con unigramas y bigramas.
- Inferencia ligera: el modelo es un MLP pequeno, adecuado para entornos con recursos muy limitados.
- No soporta generacion de texto.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-step.
- No tiene capacidades multilingues: solo ingles.
- No dispone de modo thinking, vision ni audio.
- Los terminos ausentes del vocabulario TF-IDF se ignoran.

## Casos de uso

- Clasificacion por lotes de resenas de cine en ingles: dado un corpus de resenas de IMDb, el modelo asigna una etiqueta de sentimiento a cada una; es adecuado por su bajo coste computacional y su pipeline reproducible.
- Filtrado previo en pipelines de moderacion: usar el clasificador como primera etapa para separar resenas claramente positivas o negativas antes de un analisis mas costoso con un modelo mayor.
- Etiquetado de datos para experimentos docentes: sirve como baseline de referencia en cursos de NLP para comparar TF-IDF + MLP frente a transformers.
- Analisis de tendencias de opinion: agregar predicciones sobre resenas de una pelicula para estimar la proporcion de opiniones positivas y negativas.
- Prototipado rapido de clasificadores de sentimiento: al ser un modelo pequeno y de carga sencilla, permite validar una idea de producto antes de invertir en un modelo mayor.
- Pruebas de integracion en CI/CD: el modelo se publica automaticamente por GitHub Actions, por lo que puede usarse como ejemplo de despliegue automatizado de artefactos de machine learning.
- No es adecuado para dominios fuera de IMDb ni para texto en otros idiomas, segun advierte la propia model card.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---:|
| Accuracy | 0,8600 |
| F1 macro | 0,8586 |
| Ejemplos de prueba | 100 |

No se han publicado comparaciones con otros modelos en la informacion disponible. El conjunto de prueba de 100 ejemplos es muy reducido, por lo que la precision reportada tiene un margen de error elevado y no debe extrapolarse sin validacion adicional.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo es un MLP de una capa oculta de 64 unidades sobre vectores TF-IDF dispersos, por lo que cabe en CPU y en cualquier GPU consumer.
- GPU recomendadas: no se requieren; cualquier CPU moderna es suficiente. En caso de usar GPU, una RTX 3060 o superior es mas que suficiente.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer, e incluso en CPU.
- Opciones de despliegue: carga directa con PyTorch y scikit-learn; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. Como referencia cualitativa, el modelo se situa en la categoria de clasificadores TF-IDF + MLP, frente a alternativas basadas en transformers como DistilBERT o RoBERTa fine-tuneados para analisis de sentimiento, que ofrecen mayor precision pero requieren mas recursos. No se dispone de numeros para establecer una comparacion cuantitativa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| niu-pio/imdb-sentiment-nn | no disponible | no aplica | no disponible | Hugging Face |
| Alternativas transformer para sentimiento | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo se ha evaluado dentro del dominio de IMDb; puede fallar en texto fuera de dominio.
- Puede clasificar incorrectamente sarcasmo, opiniones mixtas o resenas ambiguas, segun advierte la model card.
- Los terminos ausentes del vocabulario TF-IDF se ignoran, lo que limita la generalizacion a vocabulario no visto.
- Solo soporta ingles; no hay capacidades multilingues.
- La evaluacion se realizo sobre solo 100 ejemplos, por lo que las metricas tienen alta varianza.
- La licencia no esta disponible, por lo que no se puede confirmar el uso comercial; se debe contactar con el autor antes de usarlo en produccion.
- La model card advierte de cargar el pickle unicamente desde un repositorio y revision de confianza, dado el riesgo de ejecucion de codigo arbitrario al deserializar pickles.
- Es un proyecto de curso con cero descargas y cero likes; no hay evidencia de uso en produccion ni mantenimiento continuado.
- No se documentan sesgos conocidos, pero al entrenarse sobre resenas de IMDb puede heredar sesgos del corpus.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/niu-pio/imdb-sentiment-nn)
- [Codigo fuente e instrucciones de inferencia](https://github.com/niu-dio/imdb-sentiment-nn)
