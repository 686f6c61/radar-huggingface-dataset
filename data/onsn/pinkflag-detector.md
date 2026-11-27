# onsn/pinkflag-detector

## Resumen

PinkFlag detector es un clasificador de texto supervisado desarrollado por el usuario onsn (onsnasr), publicado en Hugging Face bajo licencia MIT. Su tarea es clasificar mensajes de aplicaciones de citas en ocho etiquetas relacionadas con dinamicas de manipulacion emocional: green_flag, love_bombing, gaslighting, controlling, guilt_tripping, disrespect, intimidation y breadcrumbing. El modelo se distribuye como un artefacto joblib de scikit-learn y no como un transformer, por lo que su huella de despliegue es minima.

Tecnicamente es un pipeline clasico de procesamiento de lenguaje natural: vectorizacion TF-IDF seguida de una regresion logistica. Se entreno sobre 591 ejemplos con etiquetas consideradas fiables por el autor, y la model card reporta una precision del 61 % en un conjunto de test limpio (intervalo de confianza del 95 %: 52-69) y un 97 % en la tarea binaria rojo frente a verde. El autor publica ademas una comparacion con un BiLSTM y con XLM-RoBERTa en su repositorio de GitHub.

Su relevancia no reside en el rendimiento bruto, que es modesto, sino en su valor como linea base reproducible y ligera para una tarea de clasificacion sensible, con datos, model card completa y alternativas neuronales documentadas. Es un modelo solo para ingles, sin soporte multilingue, y esta pensado como herramienta de apoyo, no como juicio sobre personas, tal y como advierte explicitamente el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF + regresion logistica (scikit-learn), no neuronal |
| Parametros totales | no disponible (modelo lineal; el numero depende del vocabulario TF-IDF) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no aplica (artefacto joblib; no se distribuyen pesos en safetensors ni GGUF) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | joblib (`baseline_strong.joblib`), requiere scikit-learn 1.9.1 |

## Arquitectura y entrenamiento

El modelo es un clasificador lineal clasico: un vectorizador TF-IDF transforma el texto de entrada en una representacion dispersa de n-gramas y una regresion logistica realiza la clasificacion multietiqueta sobre ocho categorias. No emplea arquitectura transformer, atencion ni capas neuronales; el pipeline completo se serializa con joblib y se ejecuta con scikit-learn 1.9.1. El repositorio ocupa 0,0 GB, coherente con un artefacto de este tipo.

El entrenamiento se realizo sobre 591 ejemplos con etiquetas consideradas fiables por el autor. La model card no detalla la composicion del dataset, el numero de tokens, el proceso de anotacion ni si hubo aumentacion de datos. El autor publica en GitHub el modelo completo, los datos y una comparacion con un BiLSTM y con XLM-RoBERTa, lo que permite reproducir y contrastar el enfoque. No se documenta RLHF, DPO ni ninguna innovacion de decodificacion.

## Capacidades

- Clasificacion de texto en ocho categorias: green_flag, love_bombing, gaslighting, controlling, guilt_tripping, disrespect, intimidation y breadcrumbing.
- Clasificacion binaria implicita rojo frente a verde, con un 97 % reportado en el conjunto de test del autor.
- Inferencia muy ligera: al ser un modelo lineal con TF-IDF, el coste computacional es minimo y no requiere GPU.
- Integracion sencilla en Python mediante `joblib.load` y scikit-learn.
- Sin soporte de tool calling, function calling ni razonamiento multi-paso.
- Sin capacidades de vision, audio ni generacion de texto.
- Solo ingles; no hay soporte multilingue declarado.

## Casos de uso

- Moderacion de comunidades de citas: clasificar mensajes reportados por usuarios en las ocho categorias para priorizar la revision humana, aprovechando que el modelo es lineal y puede procesar grandes volumenes a bajo coste.
- Senalizacion en aplicaciones de mensajeria: mostrar avisos no invasivos cuando un mensaje se clasifica como love_bombing o gaslighting, con el modelo ejecutandose en el propio servidor sin GPU.
- Investigacion academica sobre manipulacion emocional: usar el modelo como linea base reproducible frente a alternativas neuronales como BiLSTM o XLM-RoBERTa, tal y como propone el autor.
- Filtrado previo en pipelines de anotacion: preetiquetar grandes corpus de mensajes en ingles para reducir el trabajo de anotadores humanos, dado el bajo coste de inferencia.
- Educacion y concienciacion: integrar el clasificador en talleres o materiales formativos que muestren ejemplos de dinamicas de manipulacion en ingles.
- Prototipado rapido: validar una idea de producto de deteccion de red flags en horas, sin infraestructura de GPU ni dependencias de transformers.

## Benchmarks y rendimiento

| Metrica | Resultado | Notas |
|---|---|---|
| Precision en test limpio (8 clases) | 61 % (IC 95 %: 52-69) | Conjunto de test del autor |
| Precision rojo frente a verde (binario) | 97 % | Conjunto de test del autor |

La model card no publica resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar, ya que no son aplicables a esta tarea. El autor remite a su repositorio de GitHub para la comparacion con BiLSTM y XLM-RoBERTa, pero los valores concretos de esa comparacion no estan disponibles en la informacion proporcionada.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo se ejecuta en CPU.
- GPU recomendadas: no aplica.
- Cabe en cualquier equipo consumer, incluidos portatiles de gama baja y entornos serverless con poca memoria.
- Despliegue: carga directa con `joblib.load` en Python con scikit-learn 1.9.1; no es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de pesos transformer.
- Latencia y throughput: no disponibles de forma explicita, aunque al ser un modelo lineal con TF-IDF se espera un coste por inferencia muy bajo en CPU.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PinkFlag detector | TF-IDF + regresion logistica | no disponible | no disponible | MIT | Hugging Face (joblib) |
| BiLSTM (referencia del autor) | Red neuronal recurrente | no disponible | no disponible | no disponible | GitHub del autor |
| XLM-RoBERTa (referencia del autor) | Transformer multilingue | no disponible en la informacion | no disponible | no disponible | Hugging Face |

La model card menciona explicitamente la comparacion con BiLSTM y XLM-RoBERTa, pero no incluye los resultados numericos ni las especificaciones de esos modelos en la informacion proporcionada. No se dispone de datos para una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Precision modesta en la clasificacion de ocho clases (61 %), con un intervalo de confianza amplio (52-69 %), lo que limita su uso como unica fuente de decision.
- Entrenado con solo 591 ejemplos, un volumen reducido que aumenta el riesgo de sobreajuste y de baja generalizacion a dominios distintos.
- Solo ingles; no cubre mensajes en castellano ni en otros idiomas.
- Riesgo de falsos positivos y negativos en categorias sutiles como gaslighting o breadcrumbing, dificiles de distinguir sin contexto conversacional.
- El modelo clasifica mensajes aislados; no modela el historial de una conversacion multi-turno.
- El autor advierte explicitamente que no es un juicio sobre ninguna persona; no debe usarse para etiquetar o penalizar a individuos de forma automatica.
- Licencia MIT: permite uso comercial y modificacion, pero conviene revisar las condiciones de los datos de entrenamiento en el repositorio del autor.
- Dependencia de scikit-learn 1.9.1 para cargar el artefacto joblib; versiones distintas pueden romper la compatibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/onsn/pinkflag-detector
- Repositorio GitHub del autor (model card completa, datos y comparativas): https://github.com/onsnasr/pinkflag-ai-
