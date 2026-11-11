# aluc0de/bertimbau-olist-sentiment

## Resumen

El modelo `aluc0de/bertimbau-olist-sentiment` es un clasificador de sentimiento en portugues de Brasil obtenido mediante fine-tuning de BERTimbau Base (`neuralmind/bert-base-portuguese-cased`) sobre resenas de comercio electronico del dataset publico de Olist. Lo desarrolla el usuario independiente aluc0de y resuelve una tarea concreta: asignar a cada resena una de tres etiquetas (negativa, neutra o positiva) derivadas de la puntuacion de estrellas que el cliente otorgo al pedido.

Se trata de un transformer encoder de tipo BERT con 108.925.443 parametros (aproximadamente 109 millones), publicado en formato safetensors con un tamano de repositorio de 0,4 GB. La longitud de contexto corresponde a la de BERTimbau Base, es decir, 512 tokens, aunque este dato no aparece de forma explicita en la informacion disponible y se infiere de la arquitectura base.

Su relevancia es acotada pero practica: ofrece un punto de partida ligero y con licencia MIT para analisis de sentimiento en portugues dentro del dominio del comercio electronico brasileno, con un rendimiento global del 84 % de accuracy en el conjunto de test, aunque con una debilidad muy marcada en la clase neutra. Es un modelo de nicho, sin descargas ni likes en el momento de la consulta, adecuado para prototipos y pipelines de analisis de resenas mas que para produccion critica sin ajustes adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (BERTimbau Base, portugues cased) |
| Parametros totales | 108.925.443 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura base BERT: 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | Portugues (pt), con enfasis en portugues de Brasil |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder bidireccional de la familia BERT, concretamente la variante BERTimbau Base en su version cased (distingue mayusculas y minusculas), preentrenada sobre corpus en portugues de Brasil. Sobre esa base se anade una cabeza de clasificacion de secuencia con tres salidas correspondientes a las clases Negative (0), Neutral (1) y Positive (2).

El fine-tuning se realizo sobre aproximadamente 33.688 resenas unicas del Brazilian E-Commerce Public Dataset de Olist. Las etiquetas no son anotaciones humanas de sentimiento, sino que se derivaron de la columna `review_score`: puntuaciones de 1 a 2 se mapearon a negativa, 3 a neutra y 4 a 5 a positiva. El conjunto se dividio en 21.560 ejemplos de entrenamiento, 5.390 de validacion y 6.738 de test. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, el uso de RLHF/DPO (no aplicable a este tipo de tarea) ni hiperparametros como learning rate, numero de epocas o estrategia de enmascaramiento. Tampoco se menciona ninguna innovacion tecnica adicional como decodificacion especulativa o atencion lineal.

## Capacidades

- Clasificacion de texto multietiqueta en tres clases de sentimiento (negativa, neutra, positiva) para resenas en portugues.
- Analisis de sentimiento orientado al dominio del comercio electronico brasileno (resenas de producto y de pedido).
- Procesamiento de textos de hasta la longitud de contexto de BERTimbau Base (512 tokens segun la arquitectura, no confirmado en la model card).
- Manejo de texto en portugues con distincion de mayusculas y minusculas gracias al tokenizador cased.
- No soporta tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni para uso como agente.
- No dispone de modo thinking, vision, audio ni capacidades multimodales.
- Capacidad multilingue limitada al portugues; no se documenta soporte para otros idiomas.

## Casos de uso

- Monitorizacion de resenas en marketplaces: clasificar automaticamente las resenas de Olist u otras plataformas brasilenas en negativas, neutras y positivas para alimentar cuadros de mando de satisfaccion del cliente, aprovechando que el modelo fue ajustado exactamente sobre ese tipo de texto.
- Enrutamiento de tickets de atencion al cliente: usar la prediccion de sentimiento para priorizar quejas negativas hacia equipos de soporte especializados, con la cautela de que la clase neutra es poco fiable.
- Analisis de voz del cliente a escala: procesar lotes de resenas para extraer tendencias de sentimiento por producto, vendedor o categoria, dado el bajo coste computacional de un modelo de 109 millones de parametros.
- Clasificacion previa a la moderacion: detectar resenas claramente negativas que requieran revision manual o respuestas automaticas del vendedor.
- Investigacion academica en PLN para portugues: servir como linea base reproducible de clasificacion de sentimiento en dominio de e-commerce, con licencia MIT que facilita su reutilizacion.
- Prototipado rapido en pipelines de Hugging Face: integrarse mediante `transformers.pipeline("sentiment-analysis")` en pruebas de concepto de analitica de resenas sin necesidad de GPU dedicada.
- Etiquetado asistido para ampliar datasets: preetiquetar grandes volumenes de resenas y revisar manualmente solo los casos de baja confianza o de clase neutra, donde el modelo falla mas.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test (6.738 ejemplos):

| Clase | Precision | Recall | F1-Score | Soporte |
|---|---|---|---|---|
| Negative | 0,74 | 0,95 | 0,83 | 2.029 |
| Neutral | 0,35 | 0,06 | 0,10 | 631 |
| Positive | 0,93 | 0,91 | 0,92 | 4.078 |
| Accuracy | | | 0,84 | 6.738 |
| Macro avg | 0,67 | 0,64 | 0,62 | 6.738 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB solo para pesos (109 millones de parametros), mas activaciones y overhead del runtime; en la practica cabe holgadamente en cualquier GPU consumer.
- En fp16 o bf16, los pesos ocupan alrededor de 0,22 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona tambien en CPU para lotes pequenos.
- Cabe en GPU consumer: si, incluidas GTX 1650, RTX 3060, RTX 4090 y similares; tambien en Apple Silicon y en CPU.
- Opciones de despliegue: `transformers` (pipeline de sentiment-analysis), Hugging Face Inference Endpoints, servidores con `optimum`/ONNX Runtime; no se documentan pesos GGUF para llama.cpp u Ollama, por lo que su uso en esas herramientas requeriria conversion manual.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera un throughput alto en GPU y moderado en CPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aluc0de/bertimbau-olist-sentiment | 108,9 M | no disponible (base BERT: 512) | Clasificacion de sentimiento en portugues (3 clases) | MIT | Hugging Face |
| neuralmind/bert-base-portuguese-cased (BERTimbau Base) | ~110 M | 512 | Modelo base preentrenado en portugues, sin cabeza de clasificacion | MIT | Hugging Face |
| Modelos de analisis de sentimiento en portugues de la comunidad (p. ej. variantes fine-tuned de BERTimbau) | ~110 M | 512 | Clasificacion de sentimiento binaria o multietiqueta | variable | Hugging Face |

No se dispone de datos de rendimiento comparativos con alternativas concretas en la informacion proporcionada; la comparacion se limita a parametros, contexto, tarea y licencia.

## Limitaciones y advertencias

- Desequilibrio de clases severo: la clase neutra obtiene un F1 de 0,10 y un recall de 0,06, por lo que el modelo practicamente no detecta resenas neutras; no es fiable para triaje de tres clases sin reentrenamiento con ponderacion de clases o sobremuestreo.
- Etiquetas derivadas de puntuaciones de estrellas, no de anotacion humana: comentarios ironicos, sarcasticos o matizados pueden quedar mal etiquetados y el modelo hereda ese ruido.
- Dominio restringido a resenas de comercio electronico brasileno; no se garantiza su generalizacion a otros dominios (redes sociales, prensa, soporte tecnico) ni a otras variantes del portugues.
- Modelo unicamente en portugues; no soporta castellano ni otros idiomas.
- Riesgo de alucinacion no aplicable en sentido estricto al ser un clasificador, pero si existe riesgo de predicciones erroneas con alta confianza en textos fuera de distribucion.
- Sesgos potenciales derivados del dataset de Olist (sesgo de seleccion de compradores que dejan resena, posibles sesgos geograficos o de categoria de producto); no se documentan analisis de sesgo.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias; conviene citar el paper original de BERTimbau segun indica la model card.
- Para produccion, se recomienda validar sobre datos propios, calibrar umbrales y considerar un modelo especifico para la clase neutra o un enfoque binario negativo/positivo.
- No se documentan versiones cuantizadas ni formatos alternativos de pesos, lo que limita el despliegue directo en runtimes ligeros sin conversion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aluc0de/bertimbau-olist-sentiment
- Modelo base BERTimbau: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Dataset de Olist en Kaggle: https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce
- Paper de BERTimbau (Souza, Nogueira y Lotufo, BRACIS 2020): no disponible como enlace directo en la informacion proporcionada
- Repositorio o demo adicional: no disponible en la informacion proporcionada
