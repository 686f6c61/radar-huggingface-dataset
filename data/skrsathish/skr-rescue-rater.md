# skrsathish/skr-rescue-rater

## Resumen

SKR Rescue Rater es un clasificador de texto binario construido sobre DistilBERT y afinado para estimar la probabilidad de que un mensaje de ayuda en una situacion de desastre sea urgente. Lo desarrolla skrsathish (Sathish y Aswini) en el contexto del hackathon Nebius x NVIDIA Global AI Hackathon 2026, y forma parte de una aplicacion de apoyo a la decision llamada Rescue Rater, cuyo objetivo es ayudar a los operadores de emergencias a priorizar que mensajes leer primero. El modelo no toma decisiones: solo asigna una puntuacion de urgencia, y un humano revisa siempre cada mensaje.

Con 66.955.010 parametros y un repositorio de 0,3 GB, es un modelo pequeno (variante destilada de BERT) pensado para inferencia rapida y barata, no para razonamiento complejo. Su etiqueta `pipeline_tag` es `text-classification` y solo soporta ingles. La relevancia actual reside en su enfoque de triaje asistido en catastrofes (el autor lo entrena con mensajes sinteticos inspirados en el huracan Helene de 2024 en el oeste de Carolina del Norte) y en su diseno de doble comprobacion: una segunda pasada con un modelo mayor (NVIDIA Nemotron en Nebius Token Factory) que envia a revision humana cualquier discrepancia.

Es, por tanto, un componente de un sistema mayor, no un modelo de proposito general. Su valor esta en la latencia baja y en la calibracion conservadora: en la evaluacion publicada detecta el 100 % de los mensajes urgentes sinteticos, a costa de marcar como urgentes entre 0 y 8 de cada 48 mensajes tranquilos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens (max_length de entrenamiento; limite practico del fine-tuning) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; admite cuantizacion estandar de transformers, no documentada por el autor) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un DistilBERT (`distilbert-base-uncased`) con una cabeza de clasificacion de 2 clases. DistilBERT es un transformer encoder de 6 capas destilado de BERT-base, con 66 millones de parametros, vocabulario WordPiece sin distincion de mayusculas y atencion bidireccional completa. Al ser un encoder, no genera texto: produce una distribucion de probabilidad sobre las etiquetas 0 (no urgente) y 1 (urgente).

El entrenamiento se realizo sobre mensajes de ayuda sinteticos con el estilo del huracan Helene (oeste de Carolina del Norte, 2024), mezclando mensajes urgentes y no urgentes con multiples formulaciones por categoria. Se usaron 3 epocas, optimizador AdamW, tasa de aprendizaje 3e-5, tamano de lote 16, longitud maxima 64 y semilla 42. La innovacion metodologica destacable es la separacion del conjunto de test: se reservo una formulacion completa por categoria fuera del entrenamiento, de modo que la evaluacion usa frases que el modelo nunca vio. No se documenta el numero total de tokens de entrenamiento ni el uso de RLHF o DPO (no aplica en un clasificador de este tipo).

## Capacidades

- Clasificacion binaria de urgencia de mensajes de texto en ingles (urgente / no urgente) con salida de probabilidad continua.
- Triaje por bandas: el autor define URGENTE (probabilidad >= 0,7), REQUIERE REVISION (0,1 - 0,7) y RUTINA (< 0,1).
- Deteccion de categorias urgentes tipicas: personas atrapadas, emergencias medicas, personas desaparecidas y colapsos de edificios.
- Deteccion de categorias no urgentes: cortes de electricidad, peticiones de informacion, danos menores y suministros.
- Integracion sencilla via `transformers.pipeline("text-classification")`.
- No soporta tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidad multilingue: no disponible; el autor documenta que un mensaje urgente en espanol obtuvo una puntuacion de 0,08 (lo que lo clasificaria como rutina).

## Casos de uso

- Triaje de primer nivel en centros de coordinacion de emergencias: el modelo puntua cada mensaje entrante y lo clasifica en URGENTE, REQUIERE REVISION o RUTINA, de modo que el operador lee primero los de mayor probabilidad. Es adecuado por su latencia muy baja (encoder de 66 M de parametros) y su alta sensibilidad a la urgencia.
- Filtro previo a un modelo mayor en un pipeline de doble comprobacion: como en la aplicacion Rescue Rater, se puede usar este modelo como primera pasada barata y delegar la verificacion en un LLM mayor; las discrepancias se enrutan a revision humana.
- Procesamiento por lotes de volumenes altos de mensajes de redes sociales o formularios web durante una catastrofe: el coste computacional por inferencia es minimo, lo que permite puntuar miles de mensajes en pocos segundos en una sola GPU consumer.
- Priorizacion en aplicaciones de voluntariado y ONG: una organizacion puede desplegar el modelo en un servidor modesto para ordenar solicitudes de ayuda y asignar recursos de forma mas eficiente.
- Prototipado rapido de sistemas de triaje: al ser un DistilBERT con licencia Apache 2.0 y pipeline estandar, sirve como linea base reproducible para comparar con clasificadores por palabras clave (el autor lo compara con TF-IDF + regresion logistica) o con modelos mayores.
- Despliegue en entornos con recursos limitados o sin conexion: el modelo cabe en CPU y en GPUs de gama baja, lo que permite ejecutarlo en un portatil o en un dispositivo de campo durante una operacion de respuesta.

## Benchmarks y rendimiento

Evaluacion sobre conjunto de test sintetico reservado (48 mensajes urgentes y 48 tranquilos), segun la model card:

| Modelo / configuracion | Urgentes detectados | Tranquilos marcados por error |
|---|---|---|
| Este modelo, 5 semillas de entrenamiento | 48 de 48 en todas las ejecuciones | 0 a 8 de 48 (mediana 4) |
| Este modelo, semilla 42 (subido) | 48 de 48 | 4 de 48 |
| Linea base por palabras clave (TF-IDF + regresion logistica) | 48 de 48 | 39 de 48 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que no son aplicables a un clasificador binario de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en fp32 (66 M de parametros); menos de 0,2 GB en fp16 o int8. Cabe holgadamente en cualquier GPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. En GPU, cualquier modelo moderno (RTX 3060, RTX 4090, A100, H100) lo ejecuta sin problema, aunque el cuello de botella sera el preprocesado de texto, no el calculo.
- Cabe en GPU consumer: si, en cualquier GPU consumer con al menos 1 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: `transformers` (pipeline de clasificacion de texto), TorchServe, FastAPI con transformers, ONNX Runtime, o exportacion a otros runtimes. No se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI (no disponibles para este tipo de encoder en la informacion proporcionada).
- Latencia y throughput estimados: no disponibles de forma oficial; por el tamano del modelo, se espera latencia de milisegundos por muestra en GPU y de decenas de milisegundos en CPU, con throughput de miles de muestras por segundo en lote sobre GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SKR Rescue Rater | 66,9 M | 64 tokens | Clasificacion de urgencia (2 clases) | Apache 2.0 | Hugging Face |
| DistilBERT base (modelo base) | 66,9 M | 512 tokens | Modelo de lenguaje enmascarado | Apache 2.0 | Hugging Face |
| BERT-base-uncased | 110 M | 512 tokens | Modelo de lenguaje enmascarado | Apache 2.0 | Hugging Face |
| Linea base TF-IDF + regresion logistica (del propio autor) | no aplica | no aplica | Clasificacion de urgencia | no disponible | Codigo en GitHub |

La comparacion con modelos de proposito general no es directa: SKR Rescue Rater es un clasificador especializado y no compite en generacion de texto ni en razonamiento. Frente a su modelo base, la diferencia es la cabeza de clasificacion y el fine-tuning; frente a la linea base por palabras clave, la ventaja documentada es una drastica reduccion de falsos positivos (4 de 48 frente a 39 de 48).

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sinteticos: los mensajes reales son mas desordenados, mas cortos y contienen faltas de ortografia, lo que puede degradar el rendimiento fuera del dominio de entrenamiento.
- Solo ingles: un mensaje urgente en espanol obtuvo 0,08 de probabilidad, lo que lo clasificaria como rutina. No debe usarse en entornos multilingues sin un filtro o traduccion previa.
- Sensibilidad al texto no visto: el autor documenta que anadir una direccion postal movio un mensaje tranquilo de 0,02 a 0,45, lo que indica que el modelo puede reaccionar de forma impredecible ante variaciones superficiales.
- Riesgo de falsos negativos en produccion: aunque en el test sintetico detecta el 100 % de urgentes, la distribucion real puede diferir; el propio autor insiste en que un humano revise cada mensaje.
- No es un sistema de emergencias (911): debe usarse solo como apoyo a la decision con un humano al mando.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero no se ofrece ninguna garantia; el autor no documenta sesgos especificos mas alla de las limitaciones de idioma y datos sinteticos.
- Ventana de contexto muy corta (64 tokens): mensajes largos se truncan, lo que puede eliminar informacion critica.
- Sin soporte de tool calling ni agentes: no es adecuado para flujos autonomos de decision.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skrsathish/skr-rescue-rater
- Aplicacion (Hugging Face Space): https://huggingface.co/spaces/skrsathish/rescue-rater
- Codigo en GitHub: https://github.com/sathishcrmsf/rescue-rater
