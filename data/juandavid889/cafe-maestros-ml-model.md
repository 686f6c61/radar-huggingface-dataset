# JuanDavid889/cafe-maestros-ml-model

## Resumen

Maestros-Neural-Softmax-v1 es un clasificador de texto supervisado publicado por JuanDavid889 bajo el identificador `JuanDavid889/cafe-maestros-ml-model`. No es un modelo de lenguaje basado en transformers: se trata de un pipeline clásico de procesamiento de lenguaje natural que combina representación TF-IDF sobre n-gramas de subpalabras (unigramas, bigramas, prefijos y char-4-gramas) con un clasificador lineal Softmax entrenado con entropía cruzada. Su propósito es la clasificación de intenciones y entidades del negocio dentro del robot conversacional de WhatsApp de Café Maestros, una cafetería situada en Ibagué (Tolima, Colombia).

El modelo resuelve un problema acotado y muy específico: enrutar mensajes de clientes hacia una de las 63 clases del dominio del negocio (productos, categorías, domicilios, Rappi, Nequi y otras), con el objetivo declarado de ofrecer inferencia en menos de 5 milisegundos en producción. Está entrenado exclusivamente en castellano y sobre un dataset propio (`JuanDavid889/cafe-maestros-dataset`) de 1222 ejemplos, lo que lo convierte en un artefacto de nicho más que en un modelo de propósito general.

Su relevancia es limitada fuera del contexto original: no soporta generación de texto, razonamiento, código, tool calling ni agentes. Resulta útil como referencia de cómo un pipeline ligero de TF-IDF + Softmax puede resolver tareas de clasificación de intenciones con latencia mínima y requisitos de hardware prácticamente nulos, siempre que el dominio esté bien delimitado y el vocabulario cubierto por el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF sobre n-gramas de subpalabras (unigramas, bigramas, prefijos, char-4-gramas) + clasificador Softmax lineal con entropía cruzada |
| Parametros totales | no disponible (el autor reporta 3225 features de vocabulario y 63 clases; no se especifica el número de pesos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo autorregresivo; la representación es un vector TF-IDF de longitud fija) |
| Tipos de cuantizacion | no disponible (no aplica a este tipo de modelo) |
| Idiomas soportados | es (castellano) |
| Licencia | MIT |
| Formato de pesos | no disponible (librería `generic`; no se indica safetensors, GGUF ni pickle) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline clásico de clasificación de texto, no un transformer. La entrada se vectoriza mediante TF-IDF calculado sobre un vocabulario de 3225 features que combina unigramas, bigramas, prefijos y char-4-gramas (n-gramas a nivel de carácter de longitud 4). Sobre esa representación se entrena un clasificador Softmax con pérdida de entropía cruzada, optimizado durante 180 épocas. El autor reporta una evolución de la pérdida de 1,6583 a 0,0052, lo que indica un ajuste muy fuerte sobre el conjunto de entrenamiento.

El entrenamiento se realizó sobre 1222 ejemplos etiquetados en 63 clases del negocio de Café Maestros. No se documenta en la información disponible la composición exacta del dataset, si hubo separación train/validation/test, ni si se aplicaron técnicas de regularización, aumento de datos o validación cruzada. Tampoco se indica el uso de RLHF, DPO ni ningún proceso de alineación, algo esperable en un modelo de clasificación supervisada. La innovación técnica declarada se limita a la combinación de n-gramas de subpalabras con un clasificador lineal para lograr latencia inferior a 5 ms en producción.

## Capacidades

- Clasificación de texto multietiqueta en 63 clases del dominio del negocio (productos, categorías, domicilios, Rappi, Nequi y otras).
- Respuesta a preguntas dentro del dominio acotado del robot de WhatsApp de Café Maestros (etiquetado como `question-answering` en la model card, aunque la arquitectura es de clasificación).
- Inferencia de muy baja latencia: el autor declara menos de 5 milisegundos por predicción en producción.
- Manejo de variaciones léxicas y errores ortográficos leves gracias al uso de prefijos y char-4-gramas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no, únicamente castellano.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Enrutamiento de intenciones en el chatbot de WhatsApp de Café Maestros: el modelo clasifica cada mensaje entrante en una de las 63 clases del negocio y permite al bot derivar la conversación al flujo adecuado (consulta de producto, pedido, domicilio, pago) con latencia inferior a 5 ms, lo que evita cuellos de botella en picos de mensajes.
- Detección de menciones de productos y categorías: dado que el vocabulario incluye unigramas y bigramas del catálogo, el clasificador puede identificar a qué producto o categoría se refiere el cliente en mensajes informales, útil para autocompletar pedidos.
- Identificación de canal de pago o entrega: las clases incluyen Rappi, Nequi y domicilios, por lo que el modelo puede etiquetar el mensaje según el método de pago o entrega mencionado y activar el flujo correspondiente.
- Filtrado y priorización de mensajes: en un sistema de atención al cliente con volumen alto, el clasificador puede etiquetar y enrutar mensajes antes de que un agente humano los revise, reduciendo el tiempo de primera respuesta.
- Clasificación de reseñas o comentarios de clientes: el pipeline TF-IDF + Softmax puede reutilizarse, reentrenando sobre el mismo esquema, para categorizar feedback de clientes en las mismas 63 clases o en un subconjunto de ellas.
- Prototipado rápido de clasificadores de dominio: al requerir recursos mínimos de cómputo y no depender de GPU, sirve como línea base para comparar con modelos transformer en tareas de clasificación de intenciones antes de invertir en infraestructura mayor.
- Despliegue en entornos con recursos limitados: por su naturaleza lineal y su latencia declarada, puede ejecutarse en el mismo servidor que atiende el webhook de WhatsApp sin necesidad de GPU dedicada.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 99,43 % |
| Top-3 accuracy | 100 % |
| Loss inicial | 1,6583 |
| Loss final | 0,0052 |
| Epocas | 180 |
| Ejemplos de entrenamiento | 1222 |
| Clases | 63 |
| Features de vocabulario | 3225 |
| Latencia de inferencia en produccion | < 5 ms |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las métricas anteriores son las reportadas por el autor y no se especifica si corresponden a un conjunto de test independiente o al propio conjunto de entrenamiento, lo que limita su interpretación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por la naturaleza del modelo (TF-IDF + Softmax lineal) no requiere GPU.
- GPU recomendadas: no aplica; puede ejecutarse en CPU.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU dedicada.
- Opciones de despliegue: no se documentan en la información disponible; al usar la librería `generic`, el autor no especifica integración con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos generativos, no aplicables aquí).
- Latencia y throughput: el autor declara menos de 5 ms por inferencia en producción; no se reporta throughput (peticiones por segundo).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Maestros-Neural-Softmax-v1 | TF-IDF + Softmax lineal | no disponible (3225 features, 63 clases) | no aplica | Top-1 99,43 % (reportado por el autor) | MIT | Hugging Face |
| Clasificador TF-IDF + regresión logística (scikit-learn) | TF-IDF + regresión logística | configurable | no aplica | Depende del dataset | BSD-3-Clause (scikit-learn) | Ampliamente disponible |
| BETO (bert-base-spanish-wwm-cased) fine-tuneado para clasificación | Transformer encoder | ~110 M | 512 tokens | Depende del fine-tuning | MIT | Hugging Face |
| Modelos de intenciones tipo Rasa NLU (DIET) | Pipeline híbrido | configurable | no aplica | Depende del dataset | Apache 2.0 | Open source |

La comparación es orientativa: no existen resultados de benchmarks comunes entre estos sistemas y el modelo de Café Maestros, por lo que las cifras no son directamente comparables. El modelo destaca por su latencia mínima y su licencia permisiva, pero carece de la versatilidad de un transformer encoder como BETO o de un pipeline NLU completo como Rasa.

## Limitaciones y advertencias

- Dominio extremadamente acotado: entrenado sobre 1222 ejemplos y 63 clases de un único negocio; no generaliza fuera de Café Maestros sin reentrenamiento.
- Riesgo de sobreajuste: la pérdida final de 0,0052 y el 99,43 % de Top-1 sugieren un ajuste muy fuerte; no se documenta separación train/test ni validación cruzada, por lo que la métrica podría estar inflada.
- No es un modelo generativo: no produce texto libre, no razona, no ejecuta código ni soporta tool calling o agentes.
- Idiomas: únicamente castellano; no se ha evaluado su comportamiento en otras lenguas ni en variantes dialectales distintas de la colombiana.
- Sesgos conocidos: no disponible; no se documenta ningún análisis de sesgos.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí puede producir clasificaciones erróneas o asignar clases con alta confianza a mensajes fuera de dominio.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificación con atribución; no se documentan restricciones adicionales.
- Caveats para producción: la librería `generic` no especifica el formato de serialización de los pesos, lo que puede dificultar la reproducibilidad; no se documenta el proceso de tokenización exacto ni los hiperparámetros del vectorizador.
- Fecha de creación registrada en 2026-11-09, posterior a la fecha actual de consulta; conviene verificar la integridad del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JuanDavid889/cafe-maestros-ml-model
- Dataset: https://huggingface.co/datasets/JuanDavid889/cafe-maestros-dataset
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
