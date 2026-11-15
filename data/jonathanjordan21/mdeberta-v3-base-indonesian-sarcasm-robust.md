# jonathanjordan21/mdeberta-v3-base-indonesian-sarcasm-robust

## Resumen

El modelo `jonathanjordan21/mdeberta-v3-base-indonesian-sarcasm-robust` es un clasificador de sarcasmo en indonesio obtenido mediante fine-tuning de `jonathanjordan21/mdeberta-v3-base-indonesian-sarcasm`, que a su vez se basa en la arquitectura mDeBERTa-v3-base de Microsoft. Está entrenado sobre el dataset `jonathanjordan21/reddit-id-sarcasm-enriched` y su rasgo distintivo es la incorporación de una augmentación estratégica de puntuación para reducir la sensibilidad del modelo a cambios en la puntuación terminal (concretamente, la adición de un punto final).

El problema que aborda es la fragilidad de los clasificadores de sarcasmo ante perturbaciones triviales: un modelo puede invertir su predicción cuando se añade un punto al final de una frase sarcástica. Este modelo mitiga ese comportamiento mediante una augmentación que añade un punto al 40,0% de los ejemplos sarcásticos sin punto durante el entrenamiento, logrando una tasa de flip global del 1,62% en el test emparejado de robustez.

Es relevante para quienes despliegan sistemas de moderación o análisis de sentimiento en indonesio, donde la variabilidad de puntuación en texto informal (Reddit, redes sociales) es alta. El modelo es un clasificador binario de una sola tarea, no un modelo generativo, y su licencia MIT permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (mDeBERTa-v3-base, base de Microsoft) |
| Parametros totales | no disponible (mDeBERTa-v3-base tiene aproximadamente 278M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | indonesio (id) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de tamano 0.0 GB, probablemente safetensors/PyTorch segun libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de un encoder transformer mDeBERTa-v3-base adaptado al indonesio, orientado a clasificacion binaria de secuencias (sarcastico vs no sarcastico). El entrenamiento se realizo sobre el dataset `jonathanjordan21/reddit-id-sarcasm-enriched`, con batch size 16 en entrenamiento y 32 en evaluacion, learning rate 1.5e-5, semilla 42 y pesos de clase activados (`Class Weights: Enabled (True)`), lo que sugiere desbalance de clases en el dataset.

La innovacion tecnica destacable es la augmentacion de robustez a la puntuacion: al 40,0% de los ejemplos sarcasticos sin punto final se les anadio un punto durante el entrenamiento. El objetivo explicito es evitar flips falsos cuando cambia la puntuacion terminal. No se especifica en la informacion proporcionada el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF/DPO (no aplicables a un clasificador de este tipo).

## Capacidades

- Clasificacion binaria de sarcasmo en texto indonesio: devuelve `1`/`sarcastic` o `0`/`non_sarcastic`.
- Robustez a perturbaciones de puntuacion terminal: optimizado para resistir flips falsos cuando se anade un punto final.
- Inferencia via `transformers` (endpoints_compatible segun tags).
- Capacidad multilingue limitada al indonesio (`id`); no se declaran otros idiomas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un encoder clasificador, no un modelo generativo).
- No tiene modo thinking, vision ni audio.

## Casos de uso

- Moderacion de comunidades en linea: clasificar comentarios de Reddit o foros indonesios como sarcasticos para enrutarlos a revision humana o ajustar la respuesta automatica, aprovechando la robustez a puntuacion irregular del texto informal.
- Analisis de sentimiento con deteccion de ironia: preprocesar resenas o posts en indonesio y separar el sarcasmo del sentimiento literal antes de agregar polaridad, evitando que la puntuacion variable del texto de usuario distorsione la clasificacion.
- Investigacion en PLN indonesio: usar el modelo como baseline reproducible (semilla 42, hiperparametros documentados) para comparar tecnicas de augmentacion de robustez en tareas de sarcasmo.
- Filtrado de datasets: etiquetar automaticamente grandes corpus de texto indonesio para construir subconjuntos sarcasticos/no sarcasticos destinados a otros entrenamientos.
- Sistemas de alerta temprana en soporte al cliente: detectar mensajes potencialmente sarcasticos o pasivo-agresivos en tickets en indonesio para priorizar escalado a agentes humanos.
- Evaluacion de robustez de pipelines: integrar el test emparejado de puntuacion (texto original vs texto con punto final) como prueba de regresion en CI para detectar degradacion del clasificador tras cambios de preprocesado.

## Benchmarks y rendimiento

Resultados publicados por el autor en el conjunto de test primario:

| Metrica | Valor |
|---|---|
| Accuracy | 91,79% |
| Macro F1 | 0,8939 |
| Precision clase sarcasmo | 0,8074 |
| Recall clase sarcasmo | 0,8826 |
| F1 clase sarcasmo | 0,8433 |

Test emparejado de robustez a puntuacion (texto original vs texto con punto final anadido):

| Metrica | Valor |
|---|---|
| Tasa de flip global | 1,62% |
| Tasa de flip perjudicial | 1,21% |
| Tasa de flip beneficioso | 0,40% |
| Cambio medio de probabilidad | -0,0072 |
| Cambio medio de margen absoluto | 0,2635 |

No se proporcionan comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada; por ser un encoder base de tamano moderado, la inferencia en fp32/fp16 cabe holgadamente en GPUs consumer, pero no se confirma cifra concreta.
- GPU recomendadas: no disponible; cualquier GPU con suficiente VRAM para un encoder base (por ejemplo, RTX 3060 o superior) seria suficiente en la practica, sin dato confirmado.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del repo (0.0 GB) y la arquitectura base, aunque no se especifica.
- Opciones de despliegue: `transformers` (libreria declarada), endpoints compatibles (tag `endpoints_compatible`); vLLM, llama.cpp, Ollama o TGI no estan confirmados para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jonathanjordan21/mdeberta-v3-base-indonesian-sarcasm-robust | no disponible | no disponible | Clasificacion de sarcasmo (id) | MIT | Hugging Face |
| jonathanjordan21/mdeberta-v3-base-indonesian-sarcasm (modelo base) | no disponible | no disponible | Clasificacion de sarcasmo (id) | no disponible | Hugging Face |
| mDeBERTa-v3-base (Microsoft) | no disponible (aprox. 278M, no confirmado) | no disponible | Encoder multilingue generico | MIT (habitual en la familia) | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada; la comparativa se limita a categoria, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; el dataset proviene de Reddit indonesio, por lo que puede reflejar sesgos demograficos y tematicos de esa plataforma.
- Riesgo de alucinacion: no aplica en sentido generativo, pero existe riesgo de falsos positivos/negativos en la clasificacion (precision de la clase sarcasmo 0,8074 implica falsos positivos).
- Limitaciones de idioma: solo indonesio (`id`); no se garantiza rendimiento en malayo, javanes o texto code-switched.
- Limitaciones de contexto: la longitud maxima de contexto no esta documentada; textos largos pueden truncarse.
- Restricciones de licencia: MIT permite uso comercial, pero se recomienda verificar la licencia del modelo base y del dataset subyacente, no detalladas aqui.
- Caveat de produccion: la robustez se optimizo especificamente frente al punto final; otras perturbaciones (emojis, mayusculas, alargamientos) no estan cubiertas por el test publicado.
- El repositorio figura con tamano 0.0 GB y 0 descargas, lo que sugiere que los pesos podrian no estar subidos o ser de verificacion pendiente; conviene comprobar la integridad del repo antes de desplegar.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/jonathanjordan21/mdeberta-v3-base-indonesian-sarcasm-robust
- Modelo base: https://huggingface.co/jonathanjordan21/mdeberta-v3-base-indonesian-sarcasm
- Dataset: https://huggingface.co/jonathanjordan21/reddit-id-sarcasm-enriched
- No se han encontrado papers, blogs, repos ni demos adicionales en la informacion proporcionada.
