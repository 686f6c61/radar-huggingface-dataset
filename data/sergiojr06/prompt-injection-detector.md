# SergioJr06/prompt-injection-detector

## Resumen

El detector de prompt injection de SergioJr06 es un clasificador de texto binario construido mediante fine-tuning de `distilbert-base-multilingual-cased` sobre el dataset `deepset/prompt-injections`. Su funcion es etiquetar una entrada como `injecao` (intento de prompt injection) o `normal`, con el objetivo de sustituir filtros basados en patrones de texto por un modelo entrenado dentro del proyecto [rag-seguro-docs](https://github.com/SergioJr06/rag-seguro-docs). El autor lo describe explicitamente como un estudio academico de un estudiante de Ingenieria de Computacion, no como un producto de seguridad.

El modelo emplea una arquitectura transformer encoder (DistilBERT, 6 capas, destilado de BERT) con una cabeza de clasificacion nueva, 135.326.210 parametros y 0,5 GB de repositorio. El entrenamiento fue muy ligero: 4 epocas, learning rate 3e-5, batch 16, longitud maxima 128 y unos 17 segundos en una GPU T4 de Colab. La ventana de contexto efectiva es de 128 tokens, suficiente para prompts cortos pero no para documentos extensos.

Su relevancia es doble. Por un lado, demuestra que un modelo pequeno y barato puede mejorar sustancialmente una linea base TF-IDF en la deteccion de ataques sobre el conjunto de test oficial (94,8% de accuracy frente a 74,1%). Por otro, expone con transparencia las limitaciones tipicas de este tipo de filtros: sobrebloqueo de preguntas legitimas sobre seguridad, dependencia de un dataset pequeno y ausencia de garantias frente a ataques novedosos o codificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas, destilado de BERT) con cabeza de clasificacion binaria |
| Parametros totales | 135.326.210 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (longitud maxima de entrenamiento) |
| Tipos de cuantizacion | no disponible (compatible con safetensors; no se documentan variantes GGUF ni cuantizaciones) |
| Idiomas soportados | ingles (en), aleman (de); portugues evaluado solo en un conjunto propio de 29 textos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-multilingual-cased`, un encoder transformer de 6 capas y vocabulario multilingue con casing, al que se anade una capa de clasificacion nueva para dos clases (`injecao`, `normal`). No emplea atencion lineal, decodificacion especulativa ni mecanismos MoE: es un clasificador encoder estandar de la familia BERT, con la ventaja de su bajo coste computacional y su facilidad de despliegue en CPU o GPU modesta.

El entrenamiento se realizo sobre `deepset/prompt-injections` (Apache 2.0), con 546 ejemplos de entrenamiento (343 normales, 203 ataques) y 116 de test (56 normales, 60 ataques) en ingles y aleman. Se reservo un 10% del entrenamiento para validacion, con hiperparametros fijados antes de ver el test: 4 epocas, learning rate 3e-5, batch 16, weight decay 0,01, longitud maxima 128 y semilla 42. No se documenta RLHF, DPO ni ajuste por preferencias; es un fine-tuning supervisado de clasificacion. El autor reporta estabilidad en 4 semillas (42, 1, 2 y 3), con accuracy oficial entre 94,0% y 94,8%.

## Capacidades

- Clasificacion binaria de texto: distingue entre intento de prompt injection (`injecao`) y texto normal (`normal`).
- Deteccion de instrucciones maliciosas en prompts de usuario, incluyendo instrucciones ocultas en documentos segun el conjunto propio del autor.
- Soporte multilingue limitado a ingles y aleman por entrenamiento; portugues probado solo de forma exploratoria.
- Integrable como filtro de entrada en pipelines RAG o en capas de preprocesado de LLM.
- Compatible con la libreria `transformers` y con `text-embeddings-inference` / endpoints compatibles (segun tags del repositorio).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking: es exclusivamente un clasificador.

## Casos de uso

- Filtro de entrada en un RAG: clasificar cada consulta del usuario antes de recuperar documentos, bloqueando prompts que intenten manipular el sistema. Es adecuado por su baja latencia y su integracion directa con `transformers.pipeline`.
- Moderacion de prompts en un chatbot: preprocesar mensajes de usuario en ingles o aleman para marcar posibles intentos de jailbreak antes de enviarlos al LLM principal.
- Deteccion de instrucciones ocultas en documentos: segun el autor, el modelo identifico 14 de 14 ataques en su conjunto propio, incluyendo instrucciones escondidas en documentos, lo que lo hace util como capa de saneamiento de contenido recuperado.
- Prototipado y evaluacion de defensas: servir como linea base entrenada frente a filtros por patrones en proyectos de investigacion sobre seguridad de LLM.
- Educacion y demos: ejemplo didactico de fine-tuning de DistilBERT para clasificacion de seguridad, con codigo y evaluacion reproducibles.
- Prefiltrado de bajo coste en produccion: al ser un modelo de 135M de parametros, puede ejecutarse en CPU o GPU pequenas para descartar entradas sospechosas antes de modelos mas caros.
- Analisis de logs: clasificar conversaciones historicas para auditar intentos de injection en ingles y aleman.

## Benchmarks y rendimiento

| Metrica | Linea base (TF-IDF + regresion logistica) | Este modelo |
|---|---|---|
| Accuracy (test oficial, 116 ejemplos) | 74,1% | 94,8% |
| Ataques detectados (de 60) | 30 | 54 |
| Textos normales bloqueados (de 56) | 0 | 0 |
| F1 en ataques | 0,667 | 0,947 |
| Ataques detectados en conjunto propio (de 14) | 4 | 14 |
| Preguntas normales de seguridad bloqueadas (de 15) | 0 | 4 |

Estabilidad en 4 semillas (42, 1, 2, 3): accuracy oficial entre 94,0% y 94,8%, 53-54 ataques detectados de 60, 0 textos normales bloqueados de 56. En el conjunto propio, 14 de 14 ataques detectados en las cuatro semillas; preguntas normales de seguridad bloqueadas: 4, 2, 2 y 0 de 15 respectivamente. El modelo publicado corresponde a la semilla 42, la peor en ese ultimo punto.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (135M de parametros, ~0,5 GB de pesos); en fp16 aproximadamente 0,27 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entreno en una T4 gratuita de Colab en unos 17 segundos.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna (GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090) e incluso en CPU para cargas moderadas.
- Opciones de despliegue: `transformers` (pipeline de text-classification), `text-embeddings-inference` y endpoints compatibles segun los tags del repositorio. No se documentan artefactos GGUF ni soporte explicito de llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia de milisegundos por peticion en GPU y decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SergioJr06/prompt-injection-detector | 135,3M | 128 tokens | Clasificador binario fine-tuned sobre DistilBERT multilingual | Apache 2.0 | Hugging Face |
| Linea base TF-IDF + regresion logistica (mismo dataset) | no aplica | no aplica | Filtro por patrones/estadistico | no disponible | Referencia interna del autor |
| distilbert-base-multilingual-cased (modelo base) | 135,3M | 512 tokens | Encoder preentrenado sin cabeza de seguridad | Apache 2.0 | Hugging Face |

No se dispone de datos publicados de otros detectores de prompt injection comparables en la informacion proporcionada; la comparativa se limita a la linea base del autor y al modelo base. No se inventan cifras de terceros.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeno: 546 ejemplos, lo que hace que los resultados del test oficial puedan estar optimistas.
- Posible fuga entre train y test: el dataset contiene pares de textos traducidos (ingles y aleman), y una traduccion podria haber quedado en entrenamiento y la otra en test.
- Sobreloqueo de preguntas legitimas sobre seguridad: entre 0 y 4 de 15 en las pruebas del autor (media del 13%). Hipotesis no verificada: palabras como "prompt" o "jailbreak" solo aparecen en ataques en el entrenamiento.
- Etiqueta "ataque" demasiado amplia: en el dataset, instrucciones como "translate to polish" o "generate SQL code" estan rotuladas como ataque, lo que generaria falsos positivos en aplicaciones de traduccion o generacion de SQL.
- Idiomas: entrenado solo en ingles y aleman; el portugues se probo unicamente en 29 textos propios. No hay evidencia para espanol ni otros idiomas.
- No es una defensa completa: el autor advierte explicitamente que no debe usarse como unica proteccion. No se evaluaron ataques novedosos, codificados ni en otros idiomas.
- Riesgo de alucinacion no aplica como tal (es un clasificador), pero si de falsos negativos y falsos positivos con consecuencias operativas.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantias de seguridad hace desaconsejable su uso como unico control en produccion.
- Ventana de contexto de 128 tokens: prompts largos o documentos extensos se truncan, lo que puede dejar pasar instrucciones maliciosas situadas mas alla del limite.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SergioJr06/prompt-injection-detector
- Repositorio del proyecto: https://github.com/SergioJr06/rag-seguro-docs
- Dataset de entrenamiento: https://huggingface.co/datasets/deepset/prompt-injections
- Modelo base: https://huggingface.co/distilbert/distilbert-base-multilingual-cased
