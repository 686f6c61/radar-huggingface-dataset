# Map-Action/plaintes-fr-classifieur-v2

## Resumen

`Map-Action/plaintes-fr-classifieur-v2` es un clasificador de texto en frances especializado en denuncias medioambientales ciudadanas, desarrollado por Map-Action para su plataforma de cartografia de incidencias. El modelo resuelve un problema de clasificacion jerarquica: dado un texto corto en frances (por ejemplo, "Le caniveau est bouche devant l'ecole"), lo asigna a una de 8 familias de incidencia y a uno de 32 tipos concretos dentro de una taxonomia cerrada orientada a problemas de agua, residuos, calidad del aire, riesgos naturales, degradacion del suelo, mineria, biodiversidad y molestias vecinales.

Tecnicamente es un fine-tuning de `intfloat/multilingual-e5-base`, un encoder transformer de aproximadamente 278 millones de parametros con contexto de 512 tokens. El repositorio contiene dos cabezas de clasificacion independientes: `modele-famille/` (8 clases) y `modele-type/` (32 clases). El entrenamiento se realizo sobre un dataset sintetico de 3.328 textos en frances y el modelo se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones adicionales.

Su relevancia radica en el contexto de despliegue: forma parte de un pipeline de Map-Action en Mali donde las denuncias ciudadanas se recogen en bambara y se traducen automaticamente al frances antes de la clasificacion. El modelo mejora notablemente sobre las lineas base evaluadas (TF-IDF y embeddings congelados), aunque su rendimiento sobre denuncias reales no ha sido validado, ya que los datos de entrenamiento y evaluacion son enteramente sinteticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-like, base de `intfloat/multilingual-e5-base`) |
| Parametros totales | no disponible (la base E5-base ronda los 278 M, no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la base E5-base soporta 512 tokens; no confirmado explicitamente) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | frances (`fr`) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de `intfloat/multilingual-e5-base`, un encoder transformer multilingue preentrenado con objetivos de representacion de frases, y anade dos cabezas de clasificacion secuenciales sobre la representacion del token de pooling: una para las 8 familias y otra para los 32 tipos de incidencia. La entrada debe prefijarse con `query: `, convencion heredada del modelo E5 original. El repositorio pesa 2,2 GB e incluye ambos clasificadores.

El fine-tuning se realizo durante 8 epocas, con batch de 32, learning rate de 4e-5 y un schedule lineal de warm-up y decay, sobre el dataset `Map-Action/plaintes-environnement-fr` (version v2, 3.328 textos de entrenamiento). Los textos son sinteticos: se redactaron formulaciones por cada tipo de incidencia y se expandieron con aperturas, lugares y consecuencias. No se menciona uso de RLHF, DPO ni tecnicas de alineacion adicionales; se trata de un ajuste supervisado de clasificacion puro.

## Capacidades

- Clasificacion de texto corto en frances en una taxonomia cerrada de 8 familias y 32 tipos de incidencia medioambiental.
- Salida jerarquica: prediccion de familia y de tipo mediante dos cabezas independientes.
- Clasificacion de denuncias formuladas de forma variada gracias a la expansion sintetica del dataset de entrenamiento (aperturas, lugares, consecuencias).
- Integracion en pipelines de traduccion automatica: el caso de uso documentado recibe texto traducido desde bambara.
- No soporta generacion de texto, tool calling, agentes, vision ni audio: es un encoder de clasificacion.
- Capacidad multilingue limitada al frances en la practica, aunque la base E5 sea multilingue.

## Casos de uso

- Triaje de denuncias ciudadanas en plataformas de cartografia: el modelo asigna cada denuncia entrante a una familia y tipo, permitiendo enrutarla automaticamente al equipo o mapa correspondiente sin intervencion manual.
- Priorizacion de incidencias medioambientales: con la familia y el tipo predichos, un sistema aguas abajo puede ordenar por criticidad (por ejemplo, riesgos naturales frente a molestias vecinales) y asignar recursos.
- Enriquecimiento de bases de datos de incidencias: clasificar lotes historicos de denuncias para poblar dashboards y mapas de calor por categoria.
- Pipeline multilingue en contextos de cooperacion: combinado con un traductor bambara-frances, permite que ciudadanos denuncien en su lengua y el sistema clasifique en frances, como en el despliegue de Map-Action en Mali.
- Filtrado y moderacion de formularios: descartar o marcar entradas que no encajan en la taxonomia antes de que lleguen a operadores humanos.
- Analisis de tendencias por tipo de incidencia: agregar predicciones a lo largo del tiempo para detectar repuntes de una categoria concreta (por ejemplo, vertidos o calidad del aire) en una region.

## Benchmarks y rendimiento

Evaluacion sobre 512 textos reservados que solo contienen formulaciones de denuncia no vistas en entrenamiento.

| Version | Familias: macro F1 | Familias: accuracy | Tipos: macro F1 | Tipos: accuracy |
|---|---|---|---|---|
| TF-IDF + regresion logistica | 51,8 % | 54,3 % | 35,1 % | 36,9 % |
| Embeddings E5 congelados + regresion logistica | 62,6 % | 65,4 % | 53,9 % | 56,3 % |
| E5 fine-tuned, dataset v1 (2.048 textos) | 67,8 % | 69,0 % | 52,7 % | 55,3 % |
| **E5 fine-tuned, dataset v2 (3.328 textos)** | **77,2 %** | **77,7 %** | **65,7 %** | **68,4 %** |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB en fp32 para un encoder de este tamano; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU para cargas moderadas. Para alto throughput, cualquier GPU moderna (RTX 3060 en adelante, T4, A10, A100) es suficiente.
- Cabe en GPU consumer: si, en practicamente cualquier modelo (GTX 1650, RTX 3050, etc.).
- Opciones de despliegue: `transformers` con pipeline `text-classification`, TorchServe, FastAPI con batching, o exportacion a ONNX para CPU. No se documentan integraciones especificas con vLLM, llama.cpp u Ollama (no aplicables a un encoder de clasificacion).
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| `Map-Action/plaintes-fr-classifieur-v2` | Clasificador fine-tuned | no disponible (base E5-base) | no disponible (base 512) | MIT | Taxonomia cerrada de denuncias medioambientales en frances |
| `intfloat/multilingual-e5-base` | Encoder de embeddings | ~278 M (no confirmado) | 512 | MIT | Representaciones de frases multilingues, sin cabeza de clasificacion |
| TF-IDF + regresion logistica (linea base del autor) | Clasificador clasico | no aplica | no disponible | no disponible | Clasificacion por n-gramas, sin semantica |

No se dispone de comparaciones con otros clasificadores especializados en denuncias medioambientales en la informacion proporcionada.

## Limitaciones y advertencias

- Los datos de entrenamiento y evaluacion son sinteticos: no son denuncias ciudadanas reales y el modelo no ha sido evaluado sobre denuncias reales. El rendimiento en produccion puede diferir sustancialmente del reportado.
- Solapamiento taxonomico por diseno: algunas familias comparten tipos (por ejemplo, "malos olores" aparece en calidad del aire y en molestias), lo que limita el techo de precision.
- En el pipeline completo, la entrada proviene de una traduccion automatica desde bambara, que introduce errores adicionales no contemplados en la evaluacion.
- Riesgo de alucinacion de clase: al ser un clasificador de taxonomia cerrada, siempre asigna una de las 8/32 clases, incluso ante entradas fuera de dominio o sin sentido.
- Idioma: solo se ha entrenado y evaluado en frances; no hay garantias para otros idiomas pese a la base multilingue.
- Sin datos publicados sobre sesgos especificos; al derivar de un dataset sintetico, puede reproducir los sesgos de las formulaciones redactadas por los autores.
- Licencia MIT: permite uso comercial y modificacion sin restricciones adicionales, pero no hay garantia de idoneidad para usos criticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Map-Action/plaintes-fr-classifieur-v2
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-base
- Dataset de entrenamiento: `Map-Action/plaintes-environnement-fr` (referenciado en la model card)
- Plataforma Map-Action: https://www.map-action.com
