# ilkerkara/yilki-secici-movie-100m

## Resumen

yilki-secici-movie-100m es un modelo de clasificacion de texto en turco desarrollado por el usuario ilkerkara, especializado en analisis de sentimiento binario sobre resenas de peliculas. Se trata de un fine-tuning completo del modelo base ilkerkara/yilki-kulun-100m, un transformer de 100 millones de parametros preentrenado con 2.000 millones de tokens, que a su vez deriva del ecosistema de modelos Yilki. El modelo clasifica cada resena en una de dos etiquetas: `negative` o `positive`.

El modelo resuelve una tarea acotada pero bien delimitada: la clasificacion de polaridad en resenas cinematograficas en turco. Su relevancia practica radica en que ofrece un punto de partida ligero (100M de parametros, repositorio de 0,8 GB) para pipelines de analisis de opinion en turco, con un rendimiento declarado del 91,45 % de exactitud media en el conjunto de test, medido bajo un protocolo propio del autor. No es un modelo generativo ni un modelo de proposito general: es un clasificador de secuencias.

La publicacion es reciente (noviembre de 2026 segun los metadatos del repositorio) y cuenta con cero descargas y cero likes en el momento de redactar esta ficha, por lo que se trata de un modelo de nicho, sin validacion independiente por parte de la comunidad. La licencia Apache-2.0 facilita su uso comercial, aunque con las cautelas habituales sobre los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder para clasificacion de secuencias (base: Yilki Kulun 100M) |
| Parametros totales | 100.095.746 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (longitud maxima de entrenamiento: 256 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers; requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo (sin congelar capas) del modelo base ilkerkara/yilki-kulun-100m, un transformer encoder de 100M de parametros preentrenado con 2.000 millones de tokens. La cabeza de clasificacion se anade sobre el encoder y se entrena de forma conjunta con el resto de la red. El modelo utiliza codigo personalizado (`custom_code`), por lo que la carga requiere `trust_remote_code=True` en `transformers`.

El protocolo de entrenamiento declarado por el autor emplea una tasa de aprendizaje de 2e-4 para el cuerpo del modelo (4e-4 en la variante NER) y de 2e-3 para la cabeza de clasificacion (4e-3 en NER), con planificador coseno, calentamiento del 10 %, 3 epocas y longitud maxima de secuencia de 256 tokens. Se entrenaron dos semillas (0 y 1), publicadas en el directorio raiz y en el subdirectorio `tohum-1/` respectivamente. El entrenamiento se realizo exclusivamente sobre el conjunto de datos de la tarea, separado del preentrenamiento. El dataset utilizado es asparius/Turkish-Movie-Review, con 7.972 ejemplos de entrenamiento y 2.644 de test; el autor indica que la licencia de dicho dataset no esta especificada en su model card.

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) sobre resenas de peliculas en turco.
- Salida de etiquetas mediante `AutoModelForSequenceClassification`, integrable en pipelines de `transformers`.
- Entrada de texto de hasta 256 tokens durante el entrenamiento; textos mas largos requeriran truncamiento.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision.
- No dispone de tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni para uso como agente.
- Capacidad multilingue limitada al turco; el autor advierte explicitamente que el rendimiento cae fuera de ese idioma y dominio.

## Casos de uso

- Analisis de opinion en plataformas de resenas cinematograficas: clasificar automaticamente criticas de usuarios turcos como positivas o negativas para alimentar paneles de reputacion o sistemas de recomendacion. El modelo esta entrenado especificamente sobre este dominio.
- Moderacion y triaje de comentarios: priorizar resenas negativas para revision humana en foros o sitios de critica de cine en turco, aprovechando su bajo coste computacional (100M de parametros).
- Etiquetado de datasets a escala: preanotar grandes volumenes de resenas turcas antes de una revision manual, reduciendo el esfuerzo de anotacion con un modelo ligero que cabe en CPU o GPU de gama baja.
- Investigacion en PLN turco: servir como linea base reproducible para experimentos de clasificacion de sentimiento, dado que el autor publica dos semillas y un protocolo detallado.
- Monitorizacion de sentimiento de marca en el sector del entretenimiento: analizar la reception de estrenos o trailers a partir de comentarios de usuarios en turco.
- Integracion en pipelines de CI/CD de datos: incorporar el clasificador como etapa de validacion o enriquecimiento en procesos ETL que procesen texto turco, gracias a su formato safetensors y su compatibilidad con `transformers`.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de test de asparius/Turkish-Movie-Review, medidos bajo su propio protocolo:

| Modelo | Exactitud en test |
|---|---|
| yilki-secici-movie-100m (semilla 0) | 91,64 % |
| yilki-secici-movie-100m (semilla 1) | 91,26 % |
| yilki-secici-movie-100m (media) | 91,45 % |
| ConvBERT (referencia, una semilla) | 93,31 % |
| ModernBERT-tr (referencia, una semilla) | 92,89 % |
| BERTurk (referencia, una semilla) | 92,47 % |
| XLM-R (referencia, una semilla) | 91,11 % |
| mBERT (referencia, una semilla) | 89,41 % |

El autor advierte que estas cifras se midieron con su protocolo y no deben compararse directamente con numeros publicados en otros contextos. No se han publicado resultados de benchmarks en la informacion disponible mas alla de esta tabla.

## Requisitos de hardware

- VRAM estimada para inferencia en precision FP32: aproximadamente 0,4 GB solo para los pesos (100M de parametros); en FP16 o BF16, alrededor de 0,2 GB. El consumo real dependera del tamano de lote y de la longitud de secuencia.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1060, RTX 3060, RTX 4090 y similares, asi como en CPU para inferencia por lotes.
- GPU recomendadas para alto throughput: A100, H100 o L4 para procesamiento masivo por lotes; para uso individual, cualquier GPU con al menos 2 GB de VRAM es suficiente.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification` (requiere `trust_remote_code=True`); el modelo no incluye pesos GGUF, por lo que llama.cpp u Ollama no estarian soportados de forma nativa sin conversion previa. vLLM y TGI no estan orientados a clasificacion de secuencias con este formato.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de entrenamiento | Exactitud (protocolo del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yilki-secici-movie-100m | 100M | 256 tokens | 91,45 % (media de 2 semillas) | Apache-2.0 | Hugging Face |
| ConvBERT (referencia turca) | no disponible | no disponible | 93,31 % | no disponible | Hugging Face |
| ModernBERT-tr (referencia) | no disponible | no disponible | 92,89 % | no disponible | Hugging Face |
| BERTurk (referencia) | no disponible | no disponible | 92,47 % | no disponible | Hugging Face |
| XLM-R (referencia) | no disponible | no disponible | 91,11 % | no disponible | Hugging Face |
| mBERT (referencia) | no disponible | no disponible | 89,41 % | no disponible | Hugging Face |

Los modelos de referencia se midieron con el mismo protocolo segun el autor. No se dispone de datos de parametros ni contexto para esos modelos en la informacion proporcionada. El modelo de este analisis es el mas pequeno de la comparativa en terminos de parametros declarados (100M), lo que puede ser una ventaja en entornos con recursos limitados.

## Limitaciones y advertencias

- Solo funciona en turco; el rendimiento decae fuera de ese idioma y del dominio de resenas de peliculas (texto conversacional, textos cortos u otros dominios).
- Las metricas provienen de un unico conjunto de test; con conjuntos pequenos, el intervalo de confianza es amplio y la cifra de exactitud debe interpretarse con cautela.
- El modelo base se entreno con datos web, por lo que puede arrastrar sesgos y generar o propagar informacion incorrecta en sus representaciones.
- Riesgo de reproduccion de datos personales: el autor advierte que en el modelo base, de 492 fragmentos de datos personales muestreados, aproximadamente el 0,8 % se reprodujo literalmente. Si aparecen datos personales en las salidas, deben descartarse y no difundirse.
- La licencia del dataset de entrenamiento (asparius/Turkish-Movie-Review) no esta especificada, lo que introduce incertidumbre sobre las restricciones de uso comercial de los datos subyacentes, aunque la licencia del modelo sea Apache-2.0.
- Requiere `trust_remote_code=True` por el uso de codigo personalizado, lo que implica ejecutar codigo del autor; conviene auditar dicho codigo antes de desplegarlo en produccion.
- Modelo sin validacion independiente: cero descargas y cero likes en el momento de la publicacion.
- No apto para generacion de texto ni para tareas fuera de la clasificacion de sentimiento binaria.

## Enlaces

- Hugging Face: https://huggingface.co/ilkerkara/yilki-secici-movie-100m
- Modelo base: https://huggingface.co/ilkerkara/yilki-kulun-100m
- Dataset de entrenamiento: https://huggingface.co/datasets/asparius/Turkish-Movie-Review
- FineWeb-2 (datos de preentrenamiento del modelo base, ODC-BY 1.0): https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
